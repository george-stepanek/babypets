import * as React from 'react';
import { NavLink, Link, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { ApplicationState } from '../store';
import * as LitterState from '../store/Litter';
import * as $ from "jquery";
import * as DatePicker from "react-bootstrap-date-picker";
import { AnimalData } from "ClientApp/store/Model";

type LitterProps = LitterState.LitterState & typeof LitterState.actionCreators & RouteComponentProps<{ id: string }>;
class EditLitter extends React.Component<LitterProps, {}> {
    private placeholder_image = "./img/placeholder-500.png";

    componentWillMount() {
        let id = parseInt(this.props.match.params.id) || 0;
        this.props.requestLitter(id);
    }   

    componentDidMount() {
        var showPhoto = function () { $('#photo-placeholder').attr("src", $('#photo-url').val() as string); };
        $('#photo-url')
            .change(showPhoto)
            .keyup(showPhoto)
            .bind('paste', showPhoto);

        var self = this;
        $('#photo-placeholder, .grid-item img, .modal-body img').on('error', function () {
            $(this).attr("src", self.placeholder_image);
        });
    }

    public render() {
        let animalid = this.props.animalid || 0;
        let id = parseInt(this.props.match.params.id) || 0;

        if (this.props.litter) {
            var animal = this.props.litter.animals.find(a => a.id == animalid) as AnimalData;

            return <div className="litter-grid row">
                <div className="litter-pic col-sm-4">
                    <div className="litter-pic-content">
                        <img id="photo-placeholder" src={this.props.litter.pictureUrl ? this.props.litter.pictureUrl : this.placeholder_image} />
                    </div>
                    <div>
                        <textarea rows={3} wrap="soft" id="photo-url" placeholder="Paste URL of photo here" defaultValue={id > 0 ? this.props.litter.pictureUrl : ""}></textarea>
                    </div>
                </div>
                <div className="litter-details col-sm-4">
                    <b>Animal:</b>
                    <br />
                    <select id="animal" name="animal" defaultValue={this.props.litter.animal}>
                        <option value="Cat">Cat</option>
                        <option value="Dog">Dog</option>
                        <option value="Rodent">Rodent</option>
                    </select>                        
                    <br />
                    <b>Breed:</b>
                    <br />
                    <input id="breed" defaultValue={id > 0 ? this.props.litter.breed : ""}></input>
                    <br />
                    <b>Born:</b>
                    <br />
                    <DatePicker className="date-picker" value={new Date(this.props.litter.bornOn).toISOString()}></DatePicker>
                    <b>Weeks until ready:</b>
                    <br />
                    <input id="weeksToWean" type="number" defaultValue={id > 0 ? this.props.litter.weeksToWean.toString() : "0"}></input>
                    <br />
                    <b>Price:</b>
                    <br />
                    <input id="price" type="number" defaultValue={id > 0 ? this.props.litter.price.toFixed(2) : "0.00"}></input>
                    <br />
                    <b>Deposit:</b>
                    <br />
                    <input id="deposit" type="number" defaultValue={id > 0 ? this.props.litter.deposit.toFixed(2) : "0.00"}></input>
                    <br />
                    <b>Description:</b>
                    <br />
                    <textarea id="description" rows={10} defaultValue={id > 0 ? this.props.litter.description : ""}></textarea>
                    <div className="buttons">
                        <NavLink exact to={id > 0 ? '/litter/' + this.props.litter.id : "/"}>
                            <button type="button" className="btn btn-default">Cancel</button>
                        </NavLink>
                        {this.deleteButton(id)}
                        <button type="button" className="btn btn-success" onClick={() => { this.props.saveLitter(id, this) }}>Save</button>
                    </div>
                </div>
                <div className="animals-grid col-sm-4">{this.renderGrid()}</div>
                <div className="modal fade" id="animal-modal" role="dialog" key={animalid}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="litter-pic-content">
                                    <img id='animal-placeholder' src={animalid > 0 && animal.pictureUrl ? animal.pictureUrl : this.placeholder_image}></img>
                                </div>
                                <textarea rows={2} wrap="soft" id="animal-url" placeholder="Paste URL of photo here" defaultValue={animalid > 0 ? animal.pictureUrl : ""}></textarea>
                                <br />
                                <b>Gender:</b>
                                <br />
                                <input type="radio" id="male" name="Gender" value="Male" defaultChecked={animalid > 0 ? !animal.isFemale : true}></input> Male
                                <input type="radio" id="female" name="Gender" value="Female" defaultChecked={animalid > 0 ? animal.isFemale : false}></input> Female
                                <br />
                                <b>Description:</b>
                                <br />
                                <textarea rows={3} id="animal-description" defaultValue={animalid > 0 ? animal.description : ""}></textarea>
                                <br />
                                <b>Individual price (if different from the rest of the litter):</b>
                                <br />
                                <input id="animal-price" type="number" defaultValue={animalid > 0 && animal.priceOverride > 0 ? animal.priceOverride.toFixed(2) : ""}></input>
                                <br />
                                <b>For sale:</b>
                                <br />
                                <input type="checkbox" id="hold" defaultChecked={animalid > 0 ? animal.hold : false}></input> On hold
                                <input type="checkbox" id="sold" defaultChecked={animalid > 0 ? animal.sold : false}></input> Sold
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-default" data-dismiss="modal" onClick={() => { this.cancelAnimal() }}>Cancel</button>
                                {this.animalDeleteButton(animalid)}
                                <button type="button" className="btn btn-success" onClick={() => { this.props.saveAnimal(animalid, this) }}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>    
            </div>;
        }
        else
            return <div/>;
    }

    private deleteButton(id: number) {
        if (id > 0) {
            return <button type="button" className="btn btn-danger" id="delete-btn" onClick={() => { this.props.deleteLitter(id, this) }}>Delete</button>
        }
        else {
            return <span />
        }
    }

    private renderGrid() {
        if (this.props.litter)
            return <div>
                {this.props.litter.animals.map(animal =>
                    <div className="grid-item" key={animal.id} onClick={() => { this.props.showAnimal(animal.id) }}>
                        <div><img src={animal.pictureUrl ? animal.pictureUrl : this.placeholder_image} /></div>
                        <b>{animal.isFemale ? "Female" : "Male"}</b>
                        <br />
                        {animal.priceOverride > 0 ? "$" + animal.priceOverride.toFixed(0) + " " : ""}
                        <i>{animal.sold ? "Sold" : (animal.hold ? "On Hold" : "For Sale")}</i>
                    </div>
                )}
                <button type="button" className="btn btn-primary" onClick={() => { this.props.showAnimal(0) }}>Add Animal</button>
            </div>;
        else
            return <div></div>;
    }

    public cancelAnimal() {
        if (this.props.litter) {
            var animal = this.props.litter.animals.find(a => a.id == this.props.animalid) as AnimalData;
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
        }
    }

    private animalDeleteButton(animalid: number) {
        if (animalid > 0) {
            return <button type="button" className="btn btn-danger" id="animal-delete-btn" onClick={() => { this.props.deleteAnimal(animalid, this) }}>Delete</button>
        }
        else {
            return <span />
        }
    }
}

export default connect(
    (state: ApplicationState) => state.litter, // Selects which state properties are merged into the component's props
    LitterState.actionCreators                 // Selects which action creators are merged into the component's props
)(EditLitter) as typeof EditLitter;
