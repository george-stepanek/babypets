import * as Litters from './Litters';
import * as Litter from './Litter';
import * as User from './User';

// The top-level state object
export interface ApplicationState {
    litters: Litters.LittersState;
    litter: Litter.LitterState;
    user: User.UserState;
}

// Whenever an action is dispatched, Redux will update each top-level application state property using
// the reducer with the matching name. It's important that the names match exactly, and that the reducer
// acts on the corresponding ApplicationState property type.
export const reducers = {
    litters: Litters.reducer,
    litter: Litter.reducer,
    user: User.reducer
};

// This type can be used as a hint on action creators so that its 'dispatch' and 'getState' params are
// correctly typed to match your store.
export interface AppThunkAction<TAction> {
    (dispatch: (action: TAction) => void, getState: () => ApplicationState): void;
}
