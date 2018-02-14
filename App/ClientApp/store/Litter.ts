import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { AppThunkAction } from './';
import { AnimalData, LitterData } from "ClientApp/store/Model";
import * as $ from "jquery";

export interface LitterState {
    isLoading: boolean;
    id?: number;
    animalid?: number;
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
interface ShowAnimalAction {
    type: 'SHOW_ANIMAL';
    animalid: number;
}
interface SaveAnimalAction {
    type: 'SAVE_ANIMAL';
    animalid: number;
    litter: LitterData;
}
type KnownAction = RequestLitterAction | ReceiveLitterAction | SaveLitterAction | DeleteLitterAction | ShowAnimalAction | SaveAnimalAction;

export const actionCreators = {
    requestLitter: (id: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch(`api/Data/Litter?id=${id}&userid=${getState().user.userid}`)
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
            litter.pictureUrl = $("#photo-url").val() as string;

            fetch('api/Data/SaveLitter', { method: 'post', body: JSON.stringify(litter) })
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
        if (confirm("Are you sure you want to delete this litter?")) {
            fetch(`api/Data/DeleteLitter?id=${id}`, { method: 'delete' })
                .then(response => response.json() as Promise<number>)
                .then(data => {
                    dispatch({ type: 'DELETE_LITTER', id: id });
                    self.props.history.push('/');
                });
        }
    },
    showAnimal: (animalid: number, self: any): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'SHOW_ANIMAL', animalid: animalid });
        setTimeout(function () {
            ($('#animal-modal') as any).modal();

            var showAnimalPhoto = function () { $('#animal-placeholder').attr("src", $('#animal-url').val() as string); };
            $('#animal-url')
                .change(showAnimalPhoto)
                .keyup(showAnimalPhoto)
                .bind('paste', showAnimalPhoto);

            $('#animal-placeholder').on('error', function () {
                $('#animal-placeholder').attr("src", "./img/placeholder-500.png");
            });

            $("#animal-modal").on("hidden.bs.modal", function () {
                if (self.cancelAnimal) {
                    self.cancelAnimal();
                }
            });
       }, 100); // delay to allow state to update
    },
    saveAnimal: (animalid: number, self: any): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let litter = getState().litter.litter;
        if (litter) {
            var animal = litter.animals.find(a => a.id == animalid);
            if (!animal) {
                animal = {} as AnimalData;
                animal.litterId = litter.id;
                litter.animals.push(animal);
            }

            var price = parseFloat($("#animal-price").val() as string);
            animal.priceOverride = isNaN(price) ? 0 : price;
            animal.description = $("#animal-description").val() as string;
            animal.isFemale = $("#female").is(":checked");
            animal.hold = $("#hold").is(":checked");
            animal.sold = $("#sold").is(":checked");
            animal.pictureUrl = $("#animal-url").val() as string;

            if (litter.id > 0) {
                fetch('api/Data/SaveAnimal', { method: 'post', body: JSON.stringify(animal) })
                    .then(response => response.json() as Promise<number>)
                    .then(data => {
                        if (animal && litter) {
                            animal.id = data;
                            dispatch({ type: 'SAVE_ANIMAL', animalid: animal.id, litter: litter });
                            self.forceUpdate();

                            ($('#animal-modal') as any).modal("hide");
                            $('body').removeClass('modal-open');
                            $('.modal-backdrop').remove();
                        }
                    });
            }
            else {
                animal.id = new Date().getTime() % 2000000000; // unique placeholder id which will be replaced when saved to db
                dispatch({ type: 'SAVE_ANIMAL', animalid: animal.id, litter: litter });
                self.cancelAnimal();
                ($('#animal-modal') as any).modal("hide");
            }
        }
    },
    deleteAnimal: (animalid: number, self: any): AppThunkAction<KnownAction> => (dispatch, getState) => {
        if (confirm("Are you sure you want to delete this animal?")) {
            let litter = getState().litter.litter;
            fetch(`api/Data/DeleteAnimal?id=${animalid}`, { method: 'delete' })
                .then(response => response.json() as Promise<number>)
                .then(data => {
                    if (litter) {
                        for (var i = litter.animals.length - 1; i >= 0; i--) {
                            if (litter.animals[i].id === animalid) {
                                litter.animals.splice(i, 1);
                            }
                        }
                        dispatch({ type: 'SAVE_ANIMAL', animalid: 0, litter: litter });
                        self.forceUpdate();

                        ($('#animal-modal') as any).modal("hide");
                        $('body').removeClass('modal-open');
                        $('.modal-backdrop').remove();
                    }
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
            // Only accept the incoming data if it matches the most recent request, to ensure we correctly handle out-of-order responses.
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
        case 'SHOW_ANIMAL':
            return {
                id: state.id,
                animalid: action.animalid,
                litter: state.litter,
                isLoading: false
            };
        case 'SAVE_ANIMAL':
            return {
                id: state.id,
                animalid: action.animalid,
                litter: action.litter,
                isLoading: false
            };
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    return state || unloadedState;
};