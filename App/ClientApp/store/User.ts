import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { AppThunkAction } from './';
import { UserData } from "../store/Model";
import * as $ from "jquery";

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
interface SaveUserAction {
    type: 'SAVE_USER';
    userid: number;
    user?: UserData;
}
type KnownAction = RequestUserAction | ReceiveUserAction | SaveUserAction;

export const actionCreators = {
    requestUser: (userid: number, name?: string, email?: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        if(userid)
            $(".facebook-login").blur();

        let user = { id: userid, name: name, email: email };
        let fetchTask = fetch(`api/Data/Login?id=${userid}`, { method: 'post', body: JSON.stringify(user) })
            .then(response => response.json() as Promise<UserData>)
            .then(data => {
                dispatch({ type: 'RECEIVE_USER', userid: userid, user: data });
           });

        addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
        dispatch({ type: 'REQUEST_USER', userid: userid });
    },
    saveUser: (userid: number, self: any): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let user = getState().user.user;
        if (user) {
            user.name = $("#name").val() as string;
            user.email = $("#email").val() as string;
            user.phone = $("#phone").val() as string;
            user.location = $("#location").val() as string;
            user.description = $("#description").val() as string;
            user.pictureUrl = $("#photo-url").val() as string;

            fetch('api/Data/SaveUser', { method: 'post', body: JSON.stringify(user) })
                .then(response => response.json() as Promise<number>)
                .then(data => {
                    if (user) {
                        dispatch({ type: 'SAVE_USER', userid: data, user: user });
                        self.props.history.push('/litters/' + data);
                    }
                });
        }
    },
    signOut: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'SAVE_USER', userid: 0, user: undefined });
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
        case 'SAVE_USER':
            return {
                userid: action.userid,
                user: action.user
            }
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    return state || unloadedState;
};
