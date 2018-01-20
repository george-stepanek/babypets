import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { AppThunkAction } from './';
import { LitterData } from "ClientApp/store/Litters";

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface LitterState {
    isLoading: boolean;
    id?: number;
    litter?: LitterData;
}

export const actionCreators = {
}

const unloadedState: LitterState = { litter: undefined, isLoading: false };

export const reducer: Reducer<LitterState> = (state: LitterState, incomingAction: Action) => {
    return state || unloadedState;
};