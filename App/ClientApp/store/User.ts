import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { AppThunkAction } from './';
import { UserData } from "../store/Model";
import * as $ from "jquery";
import * as Validator from 'validator';

export interface UserState {
    isLoading: boolean;
    userid?: number;
    user?: UserData;
    sellerid?: number;
    seller?: UserData;
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
interface RequestSellerAction {
    type: 'REQUEST_SELLER';
    sellerid: number;
}
interface ReceiveSellerAction {
    type: 'RECEIVE_SELLER';
    sellerid: number;
    seller?: UserData;
}
type KnownAction = RequestUserAction | ReceiveUserAction | SaveUserAction | RequestSellerAction | ReceiveSellerAction;

export const actionCreators = {
    loggedIn: (token: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch(`api/Data/LoggedIn`, { headers: { Authorization: 'Bearer ' + token } })
            .then(response => response.json() as Promise<UserData>)
            .then(data => {
                dispatch({ type: 'RECEIVE_USER', userid: data.id, user: data });
            });
    },
    requestUser: (userid: number, self: any): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let token = $("meta[property='token']").attr('content');
        let fetchTask = fetch(`api/Data/GetUser?id=${userid}`, { headers: { Authorization: 'Bearer ' + token } })
            .then(response => response.json() as Promise<UserData>)
            .then(data => {
                dispatch({ type: 'RECEIVE_USER', userid: userid, user: data });
                $('#email').val(data.email);
                $('#save-button').prop('disabled', !Validator.isEmail(data.email));
                self.setState({ value: data.email });
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
            user.bankAccount = $("#bankAccount").val() as string;
            user.location = $("#location").val() as string;
            user.description = $("#description").val() as string;
            user.pictureUrl = $("#photo-url").val() as string;
            user.style = ($("#style").val() as string).replace(/</g, '').replace(/>/g, '');

            let token = $("meta[property='token']").attr('content');
            fetch('api/Data/SaveUser', { method: 'post', headers: { Authorization: 'Bearer ' + token }, body: JSON.stringify(user) })
                .then(response => response.json() as Promise<number>)
                .then(data => {
                    if (user) {
                        dispatch({ type: 'SAVE_USER', userid: userid, user: user });
                        self.props.history.push('/seller/' + userid);
                    }
                });
        }
    },
    requestSeller: (sellerid: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch(`api/Data/GetUser?id=${sellerid}`, { headers: { Authorization: 'Bearer ' } })
            .then(response => response.json() as Promise<UserData>)
            .then(data => {
                dispatch({ type: 'RECEIVE_SELLER', sellerid: sellerid, seller: data });
            });

        addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
        dispatch({ type: 'REQUEST_SELLER', sellerid: sellerid });
    }
};

const unloadedState: UserState = { user: undefined, isLoading: false };

export const reducer: Reducer<UserState> = (state: UserState, incomingAction: Action) => {
    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'REQUEST_USER':
            return {
                userid: action.userid,
                user: state.user,
                isLoading: true
            };
        case 'RECEIVE_USER':
            // Only accept the incoming data if it matches the most recent request. This ensures we correctly handle out-of-order responses.
            return {
                userid: action.userid,
                user: action.user,
                isLoading: false
            };
        case 'SAVE_USER':
            return {
                userid: action.userid,
                user: action.user,
                isLoading: false
            }
        case 'REQUEST_SELLER':
            return {
                userid: state.userid,
                user: state.user,
                sellerid: action.sellerid,
                seller: state.seller,
                isLoading: true
            };
        case 'RECEIVE_SELLER':
            // Only accept the incoming data if it matches the most recent request. This ensures we correctly handle out-of-order responses.
            if (action.sellerid === state.sellerid) {
                return {
                    userid: state.userid,
                    user: state.user,
                    sellerid: action.sellerid,
                    seller: action.seller,
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
