import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { AppThunkAction } from './';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface LittersState {
    isLoading: boolean;
    offset?: number;
    litters: LitterData[];
}

export interface LitterData {
    id: number;
    bornOn: string;
    price: number;
    deposit: number;
    breed: string;
    pictureUrl: string;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.

interface RequestLittersAction {
    type: 'REQUEST_LITTERS';
    offset: number;
}

interface ReceiveLittersAction {
    type: 'RECEIVE_LITTERS';
    offset: number;
    litters: LitterData[];
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = RequestLittersAction | ReceiveLittersAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    requestLitters: (offset: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        // Only load data if it's something we don't already have (and are not already loading)
        if (offset !== getState().litters.offset) {
            let fetchTask = fetch(`api/SampleData/Litters?offset=${offset }`)
                .then(response => response.json() as Promise<LitterData[]>)
                .then(data => {
                    dispatch({ type: 'RECEIVE_LITTERS', offset: offset, litters: data });
                });

            addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
            dispatch({ type: 'REQUEST_LITTERS', offset: offset });
        }
    }
};

// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

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
            // Only accept the incoming data if it matches the most recent request. This ensures we correctly
            // handle out-of-order responses.
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
