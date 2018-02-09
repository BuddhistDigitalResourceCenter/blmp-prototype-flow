import { call, put, takeLatest, select, all } from 'redux-saga/effects';
import { INITIATE_APP } from 'state/actions';
import * as dataActions from 'state/data/actions';
import * as uiActions from 'state/ui/actions';
import selectors from 'state/selectors';
import bdrcApi from 'api/api';
import store from 'index';

const api = new bdrcApi();

function* initiateApp() {
   try {
      let cookies = store.getState().data.cookies ;
      if(cookies) {
         let config = cookies.get("config")
         if(!config) config = yield call([api, api.loadConfig]);
         else console.log("has cookie config",config)

         yield put(dataActions.loadedConfig(config));
         yield put(dataActions.choosingHost(config.ldspdi.endpoints[config.ldspdi.index]));

      }
      const ontology = yield call([api, api.getOntology]);
      yield put(dataActions.loadedOntology(ontology));
      yield put(uiActions.newTab());
   } catch(e) {
      console.log('initiateApp error: %o', e);
      // TODO: add action for initiation failure
   }
}

function* watchInitiateApp() {
   yield takeLatest(INITIATE_APP, initiateApp);
}

function* watchEditingResource() {
   yield takeLatest(uiActions.TYPES.editingResource, selectedResource);
}

export function* loadResource(IRI) {

   console.log("load");

   yield put(dataActions.loading(IRI, true));
   try {
      const individual = yield call([api, api.getResource], IRI);
      yield put(dataActions.loadedResource(IRI, individual));
      // IRI might only be the resource ID so make sure the
      // actual IRI is set as well.
      if (individual.id !== IRI) {
         yield put(dataActions.loadedResource(individual.id, individual));
      }
   } catch(e) {
      yield put(dataActions.resourceFailed(IRI, e.message));
      yield put(dataActions.loading(IRI, false));
   }
}

export function* chooseHost(host:string) {
   try
   {
      yield call([api, api.testHost], host);
      yield put(dataActions.chosenHost(host));
   }
   catch(e)
   {
      yield put(dataActions.chosenHost(host));
      yield put(dataActions.hostError(host,e.message));
   }
}

export function* loadResult(IRI) {


   yield put(dataActions.loading(IRI, true));
   try {
      const individual = yield call([api, api.getResource], IRI);
      yield put(dataActions.loadedResource(IRI, individual));
      // IRI might only be the resource ID so make sure the
      // actual IRI is set as well.
      if (individual.id !== IRI) {
         yield put(dataActions.loadedResource(individual.id, individual));
         yield put(uiActions.editingResourceInNewTab(individual.id));
      }
   } catch(e) {
      yield put(dataActions.resourceFailed(IRI, e.message));
      yield put(dataActions.loading(IRI, false));
   }
}


export function* watchLoadResource() {

   yield takeLatest(
      dataActions.TYPES.loadResource,
      (action) => loadResource(action.payload)
   );
}

export function* watchLoadResult() {

   yield takeLatest(
      dataActions.TYPES.loadResult,
      (action) => loadResult(action.payload)
   );
}

export function* selectedResource(action) {
   const resourceIRI = action.payload;
   const resource = yield select(selectors.getResource, resourceIRI);
   const loadingResource = yield select(selectors.isResourceLoading, resourceIRI);
   if (resourceIRI && !resource && !loadingResource) {
      yield loadResource(resourceIRI);
   }
}

export function* watchSelectedResource() {
   yield takeLatest(uiActions.TYPES.selectedResourceIRI, selectedResource);
}

export function* watchFindResource() {
   yield takeLatest(
      uiActions.TYPES.findResource,
      (action) => loadResource(action.payload)
   );
}


export function* searchResource(key) {

   console.log("search",key);

   yield put(dataActions.loading(key, true));
   try {
      const result = yield call([api, api.getResults], key);
      yield put(dataActions.foundResults(key, result));

   } catch(e) {
      yield put(dataActions.resourceFailed(key, e.message));
      yield put(dataActions.loading(key, false));
   }
}

export function* watchSearchResource() {

   yield takeLatest(
      uiActions.TYPES.searchResource,
      (action) => searchResource(action.payload)
   );
}

export function* watchChoosingHost() {

   yield takeLatest(
      dataActions.TYPES.choosingHost,
      (action) => chooseHost(action.payload)
   );
}

/** Root **/

export default function* rootSaga() {
   yield all([
      watchInitiateApp(),
      watchLoadResource(),
      watchLoadResult(),
      watchSelectedResource(),
      watchFindResource(),
      watchSearchResource(),
      watchEditingResource(),
      watchChoosingHost()
   ])
}
