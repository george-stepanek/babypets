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

type KnownAction = RequestLitterAction | ReceiveLitterAction | SaveLitterAction;

export const actionCreators = {
    requestLitter: (id: number): AppThunkAction<KnownAction> => (dispatch, getState) => { 
        // Only load data if it's something we don't already have (and are not already loading)
        if (id !== getState().litter.id) {
            if (id > 0) {
                let fetchTask = fetch(`api/SampleData/Litter?id=${id}`)
                    .then(response => response.json() as Promise<LitterData>)
                    .then(data => {
                        dispatch({ type: 'RECEIVE_LITTER', id: id, litter: data });
                    });

                addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
                dispatch({ type: 'REQUEST_LITTER', id: id });
            }
            else {
                var userid = 3;
                var litter: LitterData = {
                    id: 0,
                    userId: userid,
                    bornOn: new Date().toISOString().replace("Z", ""),
                    weeksToWean: 0, price: 0, deposit: 0, animal: "", breed: "", pictureUrl: "", description: "",
                    listed: new Date().toISOString(),
                    animals: [],
                    user: { id: userid, name: "", email: "", phone: "", description: "", pictureUrl: "", location: "" }
                };
                dispatch({ type: 'RECEIVE_LITTER', id: id, litter: litter });
            }
        } 
    },
    saveLitter: (id: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let litter = getState().litter.litter;
        if (litter) {
            var dateparts = ($(".date-picker").val() as string).split('/');
            var date = new Date();
            date.setDate(parseInt(dateparts[0]));
            date.setMonth(parseInt(dateparts[1]) - 1);
            date.setFullYear(parseInt(dateparts[2]));

            litter.animal = $("#animal").val() as string;
            litter.breed = $("#breed").val() as string;
            litter.bornOn = date.toISOString().replace("Z", "");
            litter.weeksToWean = parseInt($("#weeksToWean").val() as string);
            litter.price = parseFloat($("#price").val() as string);
            litter.deposit = parseFloat($("#deposit").val() as string);
            litter.description = $("#description").val() as string;
            litter.pictureUrl = $("#pictureUrl").val() as string;

            fetch('api/SampleData/SaveLitter', { method: 'post', body: JSON.stringify(litter) });
            dispatch({ type: 'SAVE_LITTER', id: id, litter: litter });
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
            // Only accept the incoming data if it matches the most recent request. This ensures we correctly
            // handle out-of-order responses.
            if (action.id === state.id || action.id == 0) {
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
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    return state || unloadedState;
};