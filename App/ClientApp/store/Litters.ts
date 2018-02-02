import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { AppThunkAction } from './';
import { LitterData } from "../store/Model";

export interface LittersState {
    isLoading: boolean;
    offset?: number;
    litters: LitterData[];
}
interface RequestLittersAction {
    type: 'REQUEST_LITTERS';
    offset: number;
}
interface ReceiveLittersAction {
    type: 'RECEIVE_LITTERS';
    offset: number;
    litters: LitterData[];
}
type KnownAction = RequestLittersAction | ReceiveLittersAction;

export const actionCreators = {
    requestLitters: (offset: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch(`api/SampleData/Litters?offset=${offset }`)
            .then(response => response.json() as Promise<LitterData[]>)
            .then(data => {
                dispatch({ type: 'RECEIVE_LITTERS', offset: offset, litters: data });
            });

        addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
        dispatch({ type: 'REQUEST_LITTERS', offset: offset });
    }
};

const unloadedState: LittersState = { litters: [], isLoading: false };

export const reducer: Reducer<LittersState> = (state: LittersState, incomingAction: Action) => {
    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'REQUEST_LITTERS':
            return {
                offset: action.offset,
                litters: state.litters,
                isLoading: true
            };
        case 'RECEIVE_LITTERS':
            // Only accept the incoming data if it matches the most recent request. This ensures we correctly handle out-of-order responses.
            if (action.offset === state.offset) {
                return {
                    offset: action.offset,
                    litters: action.litters,
                    isLoading: false
                };
            }
            break;
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    return state || unloadedState;
};
