import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { AppThunkAction } from './';
import { LitterData } from "ClientApp/store/Litters";

export interface LitterState {
    isLoading: boolean;
    id?: number;
    litter?: LitterData;
}

interface RequestLitterAction {
    type: 'REQUEST_LITTER';
    id: number;
}

interface ReceiveLitterAction {
    type: 'RECEIVE_LITTER';
    id: number;
    litter: LitterData;
}

type KnownAction = RequestLitterAction | ReceiveLitterAction;

export const actionCreators = {
    requestLitter: (id: number): AppThunkAction<KnownAction> => (dispatch, getState) => { 
        // Only load data if it's something we don't already have (and are not already loading)
        if (id !== getState().litter.id) {
            let fetchTask = fetch(`api/SampleData/Litter?id=${id}`)
                .then(response => response.json() as Promise<LitterData>)
                .then(data => {
                    dispatch({ type: 'RECEIVE_LITTER', id: id, litter: data });
                });

            addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
            dispatch({ type: 'REQUEST_LITTER', id: id });
        } 
    }
}

const unloadedState: LitterState = { litter: undefined, isLoading: false };

export const reducer: Reducer<LitterState> = (state: LitterState, incomingAction: Action) => {
    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'REQUEST_LITTER':
            return {
                offset: action.id,
                litter: state.litter,
                isLoading: true
            };
        case 'RECEIVE_LITTER':
            // Only accept the incoming data if it matches the most recent request. This ensures we correctly
            // handle out-of-order responses.
            //if (action.id === state.id) {
                return {
                    offset: action.id,
                    litter: action.litter,
                    isLoading: false
                };
            //}
            //break;
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    return state || unloadedState;
};