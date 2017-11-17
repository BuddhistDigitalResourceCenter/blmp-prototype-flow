// @flow
import type { Action } from 'state/actions';
import createReducer from 'lib/createReducer';
import * as actions from './actions';
import type { OntologyAction } from './actions';
import Individual from 'lib/Individual';
import Ontology from '../../lib/Ontology';

export type DataState = {
    loading: {[string]: boolean},
    failures: {[string]: string},
    resources: {[IRI:string]: Individual},
    ontology: Ontology | null
}

const DEFAULT_STATE: DataState = {
    loading: {},
    failures: {},
    resources: {},
    ontology: null
}

let reducers = {};

export const loading = (state: DataState, action: actions.LoadingAction) => {
    return {
        ...state,
        loading: {
            ...state.loading,
            [action.payload.id]: action.payload.isLoading
        }
    }
}
reducers[actions.TYPES.loading] = loading;

export const loadedResource = (state: DataState, action: actions.LoadedResourceAction) => {
    state = loading(state, actions.loading(action.payload.IRI, false));
    return {
        ...state,
        resources: {
            ...state.resources,
            [action.payload.IRI]: action.payload.individual
        }
    }
}
reducers[actions.TYPES.loadedResource] = loadedResource;

export const resourceFailed = (state: DataState, action: actions.ResourceFailedAction) => {
    state = loading(state, actions.loading(action.payload.IRI, false));
    return {
        ...state,
        failures: {
            ...state.failures,
            [action.payload.IRI]: action.payload.error
        }
    }
}
reducers[actions.TYPES.resourceFailed] = resourceFailed;

export const loadedOntology = (state: DataState, action: OntologyAction) => {
    return {
        ...state,
        ontology: action.payload
    }
}
reducers[actions.TYPES.loadedOntology] = loadedOntology;

// Data Reducer
const reducer = createReducer(DEFAULT_STATE, reducers);
export default reducer;