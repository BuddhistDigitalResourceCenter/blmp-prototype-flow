import { createAction } from 'redux-actions';
import type { Action } from 'state/actions';
import Individual from 'lib/Individual';
import RDFProperty from 'lib/RDFProperty';

export const TYPES = {};

TYPES.selectedResourceIRI = 'SELECT_RESOURCE_IRI';
export const selectedResourceIRI = createAction(TYPES.selectedResourceIRI, IRI => IRI);

export type AddingResourceAction = {
    type: string,
    payload: {
        individual: Individual,
        property: RDFProperty
    }
}
TYPES.addingResource = 'ADDING_RESOURCE';
export const addingResource = (individual: Individual, property: RDFProperty): AddingResourceAction => {
    return {
        type: TYPES.addingResource,
        payload: {
            individual: individual,
            property: property
        }
    }
}