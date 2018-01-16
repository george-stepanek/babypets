import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { AppThunkAction } from './';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface LittersState {
    isLoading: boolean;
    startDateIndex?: number;
    litters: Litter[];
}

export interface Litter {
    id: number;
    bornOn: string;
    price: number;
    deposit: number;
    breed: string;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.

interface RequestLittersAction {
    type: 'REQUEST_LITTERS';
    startDateIndex: number;
}

interface ReceiveLittersAction {
    type: 'RECEIVE_LITTERS';
    startDateIndex: number;
    litters: Litter[];
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = RequestLittersAction | ReceiveLittersAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    requestLitters: (startDateIndex: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        // Only load data if it's something we don't already have (and are not already loading)
        if (startDateIndex !== getState().litters.startDateIndex) {
            let fetchTask = fetch(`api/SampleData/WeatherForecasts?startDateIndex=${ startDateIndex }`)
                .then(response => response.json() as Promise<Litter[]>)
                .then(data => {
                    dispatch({ type: 'RECEIVE_LITTERS', startDateIndex: startDateIndex, litters: data });
                });

            addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
            dispatch({ type: 'REQUEST_LITTERS', startDateIndex: startDateIndex });
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
                startDateIndex: action.startDateIndex,
                litters: state.litters,
                isLoading: true
            };
        case 'RECEIVE_LITTERS':
            // Only accept the incoming data if it matches the most recent request. This ensures we correctly
            // handle out-of-order responses.
            if (action.startDateIndex === state.startDateIndex) {
                return {
                    startDateIndex: action.startDateIndex,
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
