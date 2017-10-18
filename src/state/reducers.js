import { combineReducers } from 'redux';
import uiReducer, { UIState } from 'state/ui/reducers';
import dataReducer, { DataState } from 'state/data/reducers';

const rootReducer = combineReducers({
    ui: uiReducer,
    data: dataReducer
});

export default rootReducer;

export type AppState = {
    data: DataState,
    ui: UIState
}

export const getUIState = (state: AppState): UIState => {
    return state.ui;
}

export const getDataState = (state: AppState): DataState => {
    return state.data;
}
