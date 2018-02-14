import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { AppThunkAction } from './';
import { LitterData } from "../store/Model";

export interface LittersState {
    isLoading: boolean;
    userid?: string;
    litters: LitterData[];
}
interface RequestLittersAction {
    type: 'REQUEST_LITTERS';
    userid: string;
}
interface ReceiveLittersAction {
    type: 'RECEIVE_LITTERS';
    userid: string;
    litters: LitterData[];
}
type KnownAction = RequestLittersAction | ReceiveLittersAction;

export const actionCreators = {
    requestLitters: (userid: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch(`api/Data/Litters?userid=${userid }`)
            .then(response => response.json() as Promise<LitterData[]>)
            .then(data => {
                dispatch({ type: 'RECEIVE_LITTERS', userid: userid, litters: data });
            });

        addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
        dispatch({ type: 'REQUEST_LITTERS', userid: userid });
    }
};

const unloadedState: LittersState = { litters: [], isLoading: false };

export const reducer: Reducer<LittersState> = (state: LittersState, incomingAction: Action) => {
    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'REQUEST_LITTERS':
            return {
                userid: action.userid,
                litters: state.litters,
                isLoading: true
            };
        case 'RECEIVE_LITTERS':
            // Only accept the incoming data if it matches the most recent request. This ensures we correctly handle out-of-order responses.
            if (action.userid === state.userid) {
                return {
                    offset: action.userid,
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
