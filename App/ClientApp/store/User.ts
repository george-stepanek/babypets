import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { AppThunkAction } from './';
import { UserData } from "../store/Model";

export interface UserState {
    userid?: number;
    user?: UserData;
}
interface RequestUserAction {
    type: 'REQUEST_USER';
    userid: number;
}
interface ReceiveUserAction {
    type: 'RECEIVE_USER';
    userid: number;
    user?: UserData;
}
type KnownAction = RequestUserAction | ReceiveUserAction;

export const actionCreators = {
    requestUser: (userid: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch(`api/SampleData/Login?id=${userid}`)
            .then(response => response.json() as Promise<UserData>)
            .then(data => {
                dispatch({ type: 'RECEIVE_USER', userid: userid, user: data });
            });

        addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
        dispatch({ type: 'REQUEST_USER', userid: userid });
    }
};

const unloadedState: UserState = { user: undefined };

export const reducer: Reducer<UserState> = (state: UserState, incomingAction: Action) => {
    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'REQUEST_USER':
            return {
                userid: action.userid,
                user: state.user
            };
        case 'RECEIVE_USER':
            // Only accept the incoming data if it matches the most recent request. This ensures we correctly handle out-of-order responses.
            if (action.userid === state.userid) {
                return {
                    userid: action.userid,
                    user: action.user
                };
            }
            break;
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    return state || unloadedState;
};
