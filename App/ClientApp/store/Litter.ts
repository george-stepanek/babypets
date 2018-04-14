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
    userid?: number;
    current?: number;
}
interface RequestLitterAction {
    type: 'REQUEST_LITTER';
    id: number;
}
interface ReceiveLitterAction {
    type: 'RECEIVE_LITTER';
    id: number;
    litter: LitterData;
    userid?: number;
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
interface OpenAction {
    type: 'OPEN';
}
interface CloseAction {
    type: 'CLOSE';
}
interface NextAction {
    type: 'NEXT';
}
interface PrevAction {
    type: 'PREV';
}
interface GoAction {
    type: 'GO';
    current: number;
}
type KnownAction = RequestLitterAction | ReceiveLitterAction | SaveLitterAction | DeleteLitterAction | ShowAnimalAction | SaveAnimalAction |
    OpenAction | CloseAction | NextAction | PrevAction | GoAction;

export const actionCreators = {
    requestLitter: (id: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        fetch(`api/Data/Litter?id=${id}&userid=${getState().user.userid}`)
            .then(response => response.json() as Promise<LitterData>)
            .then(data => {
                dispatch({ type: 'RECEIVE_LITTER', id: id, litter: data, userid: getState().user.userid });
            });
        dispatch({ type: 'REQUEST_LITTER', id: id });
    },
    saveLitter: (id: number, self: any): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let litter = getState().litter.litter;
        if (litter) {
            var dateparts = ($(".date-picker").val() as string).split('/');
            litter.animal = $("#animal").val() as string;
            litter.breed = $("#breed").val() as string;
            litter.description = $("#description").val() as string;
            litter.pictureUrl = $("#photo-url").val() as string;

            // check these fields for invalid values, and if necessary set them to their defaults
            litter.bornOn = parseInt(dateparts[2]) + "-" + parseInt(dateparts[1]) + "-" + parseInt(dateparts[0]);
            litter.bornOn = Date.parse(litter.bornOn) ? litter.bornOn : new Date().toDateString();
            litter.weeksToWean = parseInt($("#weeksToWean").val() as string);
            litter.weeksToWean = litter.weeksToWean ? litter.weeksToWean : 0;
            litter.price = parseFloat($("#price").val() as string);
            litter.price = litter.price ? litter.price : 0;
            litter.deposit = parseFloat($("#deposit").val() as string);
            litter.deposit = litter.deposit ? litter.deposit : 0;

            let token = $("meta[property='token']").attr('content');
            fetch('api/Data/SaveLitter', { method: 'post', headers: { Authorization: 'Bearer ' + token }, body: JSON.stringify(litter) })
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
            let token = $("meta[property='token']").attr('content');
            fetch(`api/Data/DeleteLitter?id=${id}`, { method: 'delete', headers: { Authorization: 'Bearer ' + token } })
                .then(response => response.json() as Promise<number>)
                .then(data => {
                    dispatch({ type: 'DELETE_LITTER', id: id });
                    self.props.history.push('/edituser');
                });
        }
    },
    showAnimal: (animalid: number, self: any): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'SHOW_ANIMAL', animalid: animalid });
        setTimeout(function () {
            ($('#animal-modal') as any).modal();

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
                let token = $("meta[property='token']").attr('content');
                fetch('api/Data/SaveAnimal', { method: 'post', headers: { Authorization: 'Bearer ' + token }, body: JSON.stringify(animal) })
                    .then(response => response.json() as Promise<number>)
                    .then(data => {
                        animal.id = data;
                        dispatch({ type: 'SAVE_ANIMAL', animalid: animal.id, litter: litter });
                        self.forceUpdate();

                        ($('#animal-modal') as any).modal("hide");
                        $('body').removeClass('modal-open');
                        $('.modal-backdrop').remove();
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
            let token = $("meta[property='token']").attr('content');
            fetch(`api/Data/DeleteAnimal?id=${animalid}`, { method: 'delete', headers: { Authorization: 'Bearer ' + token } })
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
    },
    holdAnimal: (animalid: number, self: any): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let litter = getState().litter.litter;
        if (litter) {
            var animal = litter.animals.find(a => a.id == animalid);
            var path = self.props.location.pathname.indexOf("/user") >= 0 ? "userlitter" : "litter";
            if (animal) {
                if (litter.deposit > 0) {
                    fetch(`api/Data/HoldAnimal?id=${animalid}&path=${path}&address=${$("#address").val()}`, { method: 'put' })
                        .then(response => response.json() as Promise<number>)
                        .then(data => {
                            animal.hold = true;
                            dispatch({ type: 'SAVE_ANIMAL', animalid: animal.id, litter: litter });
                            self.forceUpdate();

                            self.setState({ value: '' });
                            alert('Email sent successfully!');
                        });
                }
                else {
                    fetch(`api/Data/EmailReAnimal?id=${animalid}&path=${path}&address=${$("#address").val()}`, { method: 'put' })
                        .then(response => response.json() as Promise<number>)
                        .then(data => {
                            self.setState({ value: '' });
                            alert('Email sent successfully!');
                        });
                }
            }
        }
    },
    saveIndividual: (self: any): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let litter = getState().litter.litter;
        if (litter) {
            if (litter.animals.length < 1) {
                animal = {} as AnimalData;
                animal.litterId = litter.id;
                litter.animals.push(animal);
                litter.isIndividual = true;
            }

            var animal = litter.animals[0];
            animal.isFemale = $("#female").is(":checked");
            animal.hold = $("#hold").is(":checked");
            animal.sold = $("#sold").is(":checked");

            // Need to update bornOn and pictureUrl, otherwise the values get overwritten on the SAVE_ANIMAL state update
            var dateparts = ($(".date-picker").val() as string).split('/');
            litter.bornOn = parseInt(dateparts[2]) + "-" + parseInt(dateparts[1]) + "-" + parseInt(dateparts[0]);
            litter.bornOn = Date.parse(litter.bornOn) ? litter.bornOn : new Date().toDateString();
            litter.pictureUrl = $("#photo-url").val() as string;

            dispatch({ type: 'SAVE_ANIMAL', animalid: animal.id, litter: litter });
            setTimeout(function () {
                self.props.saveLitter(litter.id, self);
            }, 100); // delay to allow state to update
        }
    },
    openGallery: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'OPEN' });
    },
    closeGallery: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'CLOSE' });
    },
    nextImage: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'NEXT' });
    },
    prevImage: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'PREV' });
    },
    goImage: (index: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'GO', current: index });
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
                    isLoading: false,
                    userid: action.userid
                };
            }
            break;
        case 'SAVE_LITTER':
            return {
                id: action.id,
                litter: action.litter,
                isLoading: false,
                userid: state.userid
            };
        case 'DELETE_LITTER':
            return {
                id: action.id,
                litter: undefined,
                isLoading: false,
                userid: state.userid
            };
        case 'SHOW_ANIMAL':
            return {
                id: state.id,
                animalid: action.animalid,
                litter: state.litter,
                isLoading: false,
                userid: state.userid
            };
        case 'SAVE_ANIMAL':
            return {
                id: state.id,
                animalid: action.animalid,
                litter: action.litter,
                isLoading: false,
                userid: state.userid
            };
        case 'OPEN':
            return {
                id: state.id,
                animalid: state.animalid,
                litter: state.litter,
                isLoading: false,
                userid: state.userid,
                current: 0
            };
        case 'CLOSE':
            return {
                id: state.id,
                animalid: state.animalid,
                litter: state.litter,
                isLoading: false,
                userid: state.userid
            };
        case 'NEXT':
            return {
                id: state.id,
                animalid: state.animalid,
                litter: state.litter,
                isLoading: false,
                userid: state.userid,
                current: state.current + 1
            };
        case 'PREV':
            return {
                id: state.id,
                animalid: state.animalid,
                litter: state.litter,
                isLoading: false,
                userid: state.userid,
                current: state.current - 1
            };
        case 'GO':
            return {
                id: state.id,
                animalid: state.animalid,
                litter: state.litter,
                isLoading: false,
                userid: state.userid,
                current: action.current
            };
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    return state || unloadedState;
};