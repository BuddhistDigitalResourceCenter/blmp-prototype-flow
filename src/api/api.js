// @flow
import md5 from 'md5';
import Graph from '../lib/Graph';
import Ontology from '../lib/Ontology';
import Individual from '../lib/Individual';

const directoryPrefixes = {
    'C': 'corporations',
    'UT': 'etexts',
    'I': 'items',
    'L': 'lineages',
    'R': 'offices',
    'P': 'persons',
    'G': 'places',
    'PR': 'products',
    'T': 'topics',
    'W': 'works'
}

const OBJECT_PATH = '/objects';
const ONTOLOGY_PATH = '/bdrc.owl'
const ONTOLOGY_BASE_IRI = 'http://purl.bdrc.io/ontology/core/';
const BASE_IRI = 'http://purl.bdrc.io/resource/';
const TURTLE_MIME_TYPE = 'text/turtle';

export const REMOTE_ENTITIES = [
    "http://purl.bdrc.io/ontology/core/Corporation",
    "http://purl.bdrc.io/ontology/core/Item",
    "http://purl.bdrc.io/ontology/core/Lineage",
    "http://purl.bdrc.io/ontology/core/Person",
    "http://purl.bdrc.io/ontology/core/Place",
    "http://purl.bdrc.io/ontology/admin/Product",
    "http://purl.bdrc.io/ontology/core/Work",
    "http://purl.bdrc.io/ontology/core/Topic",
    "http://purl.bdrc.io/ontology/core/Work"
]

export interface APIResponse {
    text(): Promise<string>
}

type APIOptions = {
    server?: string,
    fetch?: (req: string) => Promise<*>
}

export class ResourceNotFound extends Error {};

export class InvalidResource extends Error {};

export default class API {
    _server: string;
    _fetch: (req: string) => Promise<APIResponse>
    _ontology: Ontology;

    constructor(options: ?APIOptions) {
        if (options) {
            if (options.server) this._server = options.server;
            this._fetch = (options.fetch) ? options.fetch : window.fetch.bind(window);
        } else {
            this._fetch = window.fetch.bind(window);
        }
    }

    getURLContents(url: string): Promise<string> {
        let text;
        return new Promise((resolve, reject) => {
            this._fetch(url).then((response) => {
                if (!response.ok) {
                    if (response.status == '404') {
                        throw new ResourceNotFound('The resource does not exist.');
                    }
                }
                response.text().then((reqText) => {
                    text = reqText;
                    resolve(text);
                });
            }).catch((e) => {
                reject(e);
            });
        });
    }

    async getOntology(): Promise<Ontology> {
        if (!this._ontology) {
            let ontologyData = await this.getURLContents(this._ontologyPath);
            this._ontology = await this._processOntologyData(ontologyData);
        }
        
        return this._ontology;
    }

    get _ontologyPath(): string {
        let path = ONTOLOGY_PATH;
        if (this._server) {
            path = this._server + '/' + ONTOLOGY_PATH;
        }

        return path;
    }

    async _processOntologyData(ontologyData: string): Promise<Ontology> {
        const mimeType = 'application/rdf+xml';
        let ontology = await Ontology.create(
            ontologyData, ONTOLOGY_BASE_IRI, mimeType
        );

        return ontology;
    }

    /**
     * Return the full IRI for an object.
     * 
     * e.g. if given G844, it would return http://purl.bdrc.io/resource/G844
     * 
     * If id is already a valid IRI, that will be returned unchanged.
     */
    _getResourceIRI(id: string): string {
        if (id.indexOf("http://") !== -1) {
            return id;
        }

        return BASE_IRI + id;
    }

    /**
     * Return the resource id of an object.
     * 
     * e.g. for http://purl.bdrc.io/resource/G844 it would return G844
     * 
     * If id is not an IRI, it will be returned unchanged.
     */
    _getResourceId(id: string): string {
        if (id.indexOf("http://") === -1) {
            return id;
        }

        return id.substr(id.lastIndexOf('/') + 1);
    }
    
    _getResourceURL(objectId: string): string {
        const id = this._getResourceId(objectId);
        let firstChars = null;
        try {
            firstChars = id.match(/^([A-Z]{0,2})/)[0];
        } catch(e) {
            throw new InvalidResource('The resource does not start with a valid character.');
        }
    
        let dir = directoryPrefixes[firstChars];
        if (!dir) {
            throw new InvalidResource('The resource does not start with a valid character.');
        }
    
        const checksum = md5(id);
        const objectDir = checksum.substr(0, 2);
    
        let url = [OBJECT_PATH, dir, objectDir, id].join('/') + '.ttl';
        if (this._server) {
            url = this._server + url;
        }
        return url;
    }
    
    async _getResourceData(id: string): Promise<string | null> {
        try {
            let url = this._getResourceURL(id);
            let resourceData = this.getURLContents(url);
            return resourceData;
        } catch(e) {
            throw e;
        }
    }
    
    async getResource(id: string): Promise<Individual | null> {
        let data: string;
        try {
            data = String(await this._getResourceData(id));
        } catch(e) {
            throw e;
        }

        let ontology;
        try {
            ontology = await this.getOntology();
        } catch(e) {
            throw e;
        }
        
        let graph;
        try {
            graph = await Graph.create(data, BASE_IRI, TURTLE_MIME_TYPE, ontology);
        } catch(e) {
            throw e;
        }
    
        const ind = graph.getIndividualWithId(this._getResourceIRI(id));
        ind.namespaces = graph.namespaces;
        return ind;
    }
}
