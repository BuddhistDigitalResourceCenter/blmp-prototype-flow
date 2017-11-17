import React from 'react';
import { connect } from 'react-redux';

import * as ui from 'state/ui/actions';
import selectors from 'state/selectors';
import Individual from 'lib/Individual';
import RDFProperty from 'lib/RDFProperty';

import TabContent from 'components/TabContent';

const mapStateToProps = (state, ownProps) => {
    const ontology = selectors.getOntology(state);
    const tabId = ownProps.tabId;

    let editingResourceIRI;
    let editingResource;
    let individual;
    let editingResourceIsLoading;
    let editingResourceError;

    let findingResource;
    let findingResourceError;
    let findingResourceId;

    let addingResource;
    let selectedResourceIRI;

    if (tabId) {
        editingResourceIRI = selectors.getEditingResourceIRI(state, tabId);
        if (editingResourceIRI) {
            editingResource = selectors.getResource(state, editingResourceIRI);
            individual = editingResource;
            editingResourceIsLoading = selectors.isResourceLoading(state, editingResourceIRI);
            editingResourceError = selectors.getResourceError(state, editingResourceIRI);
        }

        findingResourceId = selectors.getFindResource(state, tabId);
        
        if (findingResourceId) {
            findingResource = selectors.getResource(state, findingResourceId);
            findingResourceError = selectors.getResourceError(state, findingResourceId);
        }

        addingResource = selectors.getAddingResource(state, tabId);
        selectedResourceIRI = selectors.getSelectedResourceIRI(state, tabId);
    }
    
    return {
        ontology,
        editingResourceIRI,
        editingResource,
        individual,
        editingResourceIsLoading,
        editingResourceError,
        selectedResourceIRI,
        addingResource,
        findingResourceId,
        findingResource,
        findingResourceError
    }
};

const mapDispatchToProps = (dispatch, ownProps) => {
    const tabId = ownProps.tabId;
    return {
        onOpenedResource: (resource: Individual) => {
            dispatch(ui.editingResource(tabId, resource.id));
        },
        onSelectedResource: (IRI: string) => {
            dispatch(ui.selectedResourceIRI(tabId, IRI));
        },
        onAddResource: (indvidual: Individual, property: RDFProperty) => {
            dispatch(ui.addingResource(tabId, indvidual, property));
        },
        onCancelAddingResource: () => dispatch(ui.cancelAddingResource(tabId)),
        onFindResource: (id) => dispatch(ui.findResource(tabId, id)),
        onAddedProperty: () => dispatch(ui.addedFoundResource(tabId))
    }
};

const TabContentContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(TabContent);

export default TabContentContainer;