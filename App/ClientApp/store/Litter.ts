import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { AppThunkAction } from './';
import { LitterData } from "ClientApp/store/Model";
import * as $ from "jquery";

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
interface SaveLitterAction {
    type: 'SAVE_LITTER';
    id: number;
    litter: LitterData;
}
interface DeleteLitterAction {
    type: 'DELETE_LITTER';
    id: number;
}
type KnownAction = RequestLitterAction | ReceiveLitterAction | SaveLitterAction | DeleteLitterAction;

export const actionCreators = {
    requestLitter: (id: number): AppThunkAction<KnownAction> => (dispatch, getState) => { 
        let fetchTask = fetch(`api/SampleData/Litter?id=${id}`)
            .then(response => response.json() as Promise<LitterData>)
            .then(data => {
                dispatch({ type: 'RECEIVE_LITTER', id: id, litter: data });
            });

        addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
        dispatch({ type: 'REQUEST_LITTER', id: id });
    },
    saveLitter: (id: number, self: any): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let litter = getState().litter.litter;
        if (litter) {
            var dateparts = ($(".date-picker").val() as string).split('/');
            litter.bornOn = parseInt(dateparts[2]) + "-" + parseInt(dateparts[1]) + "-" + parseInt(dateparts[0]);
            litter.animal = $("#animal").val() as string;
            litter.breed = $("#breed").val() as string;
            litter.weeksToWean = parseInt($("#weeksToWean").val() as string);
            litter.price = parseFloat($("#price").val() as string);
            litter.deposit = parseFloat($("#deposit").val() as string);
            litter.description = $("#description").val() as string;
            litter.pictureUrl = $("#pictureUrl").val() as string;

            fetch('api/SampleData/SaveLitter', { method: 'post', body: JSON.stringify(litter) })
                .then(response => response.json() as Promise<number>)
                .then(data => {
                    if (litter) {
                        litter.id = data;
                        dispatch({ type: 'SAVE_LITTER', id: litter.id, litter: litter });
                        self.props.history.push('/litter/' + litter.id);
                    }
                });
        }
    },
    deleteLitter: (id: number, self: any): AppThunkAction<KnownAction> => (dispatch, getState) => {
        if (confirm("Are you sure?")) {
            fetch(`api/SampleData/DeleteLitter?id=${id}`, { method: 'delete' })
                .then(response => response.json() as Promise<number>)
                .then(data => {
                    dispatch({ type: 'DELETE_LITTER', id: id });
                    self.props.history.push('/');
                });
        }
    }
}

const unloadedState: LitterState = { litter: undefined, isLoading: false };

export const reducer: Reducer<LitterState> = (state: LitterState, incomingAction: Action) => {
    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'REQUEST_LITTER':
            return {
                id: action.id,
                litter: state.litter,
                isLoading: true
            };
        case 'RECEIVE_LITTER':
            // Only accept the incoming data if it matches the most recent request. This ensures we correctly handle out-of-order responses.
            if (action.id === state.id) {
                return {
                    id: action.id,
                    litter: action.litter,
                    isLoading: false
                };
            }
            break;
        case 'SAVE_LITTER':
            return {
                id: action.id,
                litter: action.litter,
                isLoading: false
            };
        case 'DELETE_LITTER':
            return {
                id: action.id,
                litter: undefined,
                isLoading: false
            };
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    return state || unloadedState;
};