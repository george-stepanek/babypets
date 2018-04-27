import { fetch } from 'domain-task';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { ApplicationState } from '../store';
import * as LitterState from '../store/Litter';
import * as $ from "jquery";
import * as DatePicker from "react-bootstrap-date-picker";
import { photoUploader, animalSelect } from './Utils'
import { ThumbAnimal } from './ThumbAnimal';

const placeholder_image = "./img/placeholder-500.png";

type LitterProps = LitterState.LitterState & typeof LitterState.actionCreators & RouteComponentProps<{ id: string }>;
class EditLitter extends React.Component<LitterProps, {}> {
    componentWillMount() {
        let id = parseInt(this.props.match.params.id) || 0;
        this.props.requestLitter(id);
    }

    public render() {
        let id = parseInt(this.props.match.params.id) || 0;
        let animalid = this.props.animalid || 0;

        if (this.props.litter) {
            var animal = this.props.litter.animals.find(a => a.id == animalid);
            if (this.props.isLoading)
                return <div className="loading"><i className="fa fa-spinner fa-spin"></i></div>;
            else
                return <div className="columns-container row">
                    <div className="picture-column col-sm-4">
                        <div className="picture-column-image">
                            <img id="photo-placeholder" src={this.props.litter.pictureUrl ? this.props.litter.pictureUrl : placeholder_image} />
                        </div>
                        <input id="photo-url" type="hidden" defaultValue={this.props.litter.pictureUrl}></input>
                        <div className="buttons">
                            {this.props.userid == this.props.litter.userId && (
                                <button type="button" className="btn btn-primary" onClick={() => { photoUploader('photo-url', 'photo-placeholder') }}>Upload Photo</button>
                            )}
                        </div>
                    </div>
                    <div className="details-column col-sm-4">
                        <b>Animal:</b>
                        {animalSelect(null, this.props.litter.animal)}
                        <b>Breed or species:</b>
                        <input id="breed" className="form-control" defaultValue={id > 0 ? this.props.litter.breed : ""}></input>
                        <b>Born:</b>
                        <DatePicker className="date-picker date-born" dateFormat="DD/MM/YYYY" value={new Date(this.props.litter.bornOn).toISOString()}></DatePicker>
                        <b>Weeks until ready:</b>
                        <input id="weeksToWean" type="number" className="form-control" defaultValue={id > 0 ? this.props.litter.weeksToWean.toString() : "0"}></input>
                        <b>Price:</b>
                        <input id="price" type="number" className="form-control" defaultValue={id > 0 ? this.props.litter.price.toFixed(2) : "0.00"}></input>
                        <b>Deposit (if applicable):</b>
                        <input id="deposit" type="number" className="form-control" defaultValue={id > 0 ? this.props.litter.deposit.toFixed(2) : ""}></input>
                        <b>Description:</b>
                        <textarea id="description" rows={10} className="form-control" defaultValue={id > 0 ? this.props.litter.description : ""}></textarea>
                        <div className="buttons">
                            <button type="button" className="btn btn-primary" onClick={() => { this.props.history.push(id > 0 ? '/litter/' + id : "/"); }}>Cancel</button>
                            {this.props.userid == this.props.litter.userId && id > 0 && (
                                <button type="button" className="btn btn-danger" id="delete-btn" onClick={() => { this.props.deleteLitter(id, this) }}>Delete</button>
                            )}
                            {this.props.userid == this.props.litter.userId && (
                                <button type="button" className="btn btn-success" onClick={() => { this.props.saveLitter(id, this) }}>Save</button>
                            )}
                        </div>
                    </div>
                    <div className="grid-column col-sm-4">{this.renderGrid()}</div>
                    <div className="modal fade" id="animal-modal" role="dialog" key={animalid}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-body">
                                    <div className="picture-column-image">
                                        <img id='animal-placeholder' src={animalid > 0 && animal.pictureUrl ? animal.pictureUrl : placeholder_image}></img>
                                    </div>
                                    <input id="animal-url" type="hidden" defaultValue={animalid > 0 ? animal.pictureUrl : ""}></input>
                                    <div className="buttons">
                                        {this.props.userid == this.props.litter.userId && (
                                            <button type="button" className="btn btn-primary" onClick={() => { photoUploader('animal-url', 'animal-placeholder') }}>Upload Photo</button>
                                        )}
                                    </div>
                                    <b>Gender:</b>
                                    <br />
                                    <label className="radio-inline"><input type="radio" id="male" name="Gender" value="Male" defaultChecked={animalid > 0 ? !animal.isFemale : true}></input> Male</label>
                                    <label className="radio-inline"><input type="radio" id="female" name="Gender" value="Female" defaultChecked={animalid > 0 ? animal.isFemale : false}></input> Female</label>
                                    <br />
                                    <b>Description:</b>
                                    <textarea rows={2} id="animal-description" className="form-control" defaultValue={animalid > 0 ? animal.description : ""}></textarea>
                                    <b>Individual price (if different from the rest of the litter):</b>
                                    <input id="animal-price" type="number" className="form-control" defaultValue={animalid > 0 && animal.priceOverride > 0 ? animal.priceOverride.toFixed(2) : ""}></input>
                                    <b>For sale:</b>
                                    <br />
                                    <label className="checkbox-inline"><input type="checkbox" id="hold" defaultChecked={animalid > 0 ? animal.hold : false}></input> On hold</label>
                                    <label className="checkbox-inline"><input type="checkbox" id="sold" defaultChecked={animalid > 0 ? animal.sold : false}></input> Sold</label>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={() => { this.cancelAnimal() }}>Cancel</button>
                                    {this.props.userid == this.props.litter.userId && animalid > 0 && (
                                        <button type="button" className="btn btn-danger" id="animal-delete-btn" onClick={() => { this.props.deleteAnimal(animalid, this) }}>Delete</button>
                                    )}
                                    {this.props.userid == this.props.litter.userId && (
                                        <button type="button" className="btn btn-success" onClick={() => { this.props.saveAnimal(animalid, this) }}>Save</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>;
        }
        else return <div />;
    }

    private renderGrid() {
        return <div>
            <div className="add-button">
                <button type="button" className="btn btn-primary" onClick={() => { this.props.showAnimal(0, this) }}>Add Animal</button>
            </div>
            {this.props.litter.animals.map(animal => <ThumbAnimal animal={animal} showAnimal={this.props.showAnimal} self={this} />)}
        </div>;
    }

    public cancelAnimal() {
        var animal = this.props.litter.animals.find(a => a.id == this.props.animalid);
            
        var url = $("#animal-url").val();
        if(!animal || animal.pictureUrl != url) {
            fetch(`api/Data/DeleteImage?url=${url}`, { method: 'delete' });
        }

        if (animal) {
            $("#animal-description").val(animal.description);
            $("#animal-url").val(animal.pictureUrl);
            $("#animal-price").val(animal.priceOverride > 0 ? animal.priceOverride.toFixed(2) : "")
            $("#female").prop('checked', animal.isFemale);
            $("#male").prop('checked', !animal.isFemale);
            $("#hold").prop('checked', animal.hold);
            $("#sold").prop('checked', animal.sold);
        }
        else {
            $("#animal-description").val("");
            $("#animal-url").val("");
            $("#animal-price").val("")
            $("#female").prop('checked', false);
            $("#male").prop('checked', true);
            $("#hold").prop('checked', false);
            $("#sold").prop('checked', false);
        }
        $('#animal-placeholder').attr("src", $('#animal-url').val() as string);
    }
}

export default connect(
    (state: ApplicationState) => state.litter, // Selects which state properties are merged into the component's props
    LitterState.actionCreators                 // Selects which action creators are merged into the component's props
)(EditLitter) as typeof EditLitter;
