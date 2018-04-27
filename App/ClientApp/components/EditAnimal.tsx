import { fetch } from 'domain-task';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { ApplicationState } from '../store';
import * as LitterState from '../store/Litter';
import * as $ from "jquery";
import * as DatePicker from "react-bootstrap-date-picker";
import { photoUploader, animalSelect } from './Utils'

const placeholder_image = "./img/placeholder-500.png";

type LitterProps = LitterState.LitterState & typeof LitterState.actionCreators & RouteComponentProps<{ id: string }>;
class EditAnimal extends React.Component<LitterProps, {}> {
    componentWillMount() {
        let id = parseInt(this.props.match.params.id) || 0;
        this.props.requestLitter(id);
    }

    public render() {
        let id = parseInt(this.props.match.params.id) || 0;

        if (this.props.litter && (id == 0 || this.props.litter.animals.length > 0)) {
            var animal = this.props.litter.animals[0];
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
                        <b>Gender:</b>
                        <br />
                        <label className="radio-inline"><input type="radio" id="male" name="Gender" value="Male" defaultChecked={id > 0 ? !animal.isFemale : true}></input> Male</label>
                        <label className="radio-inline"><input type="radio" id="female" name="Gender" value="Female" defaultChecked={id > 0 ? animal.isFemale : false}></input> Female</label>
                        <br/>
                        <b>Born (approx):</b>
                        <DatePicker className="date-picker date-born" dateFormat="DD/MM/YYYY" value={new Date(this.props.litter.bornOn).toISOString()}></DatePicker>
                        <b>Price:</b>
                        <input id="price" type="number" className="form-control" defaultValue={id > 0 ? this.props.litter.price.toFixed(2) : "0.00"}></input>
                        <b>Deposit (if applicable):</b>
                        <input id="deposit" type="number" className="form-control" defaultValue={id > 0 ? this.props.litter.deposit.toFixed(2) : ""}></input>
                        <b>Description:</b>
                        <textarea id="description" rows={8} className="form-control" defaultValue={id > 0 ? this.props.litter.description : ""} style={{ "margin-bottom": "10px" }}></textarea>
                        <b>For sale:</b>
                        <br />
                        <label className="checkbox-inline"><input type="checkbox" id="hold" defaultChecked={id > 0 ? animal.hold : false}></input> On hold</label>
                        <label className="checkbox-inline"><input type="checkbox" id="sold" defaultChecked={id > 0 ? animal.sold : false}></input> Sold</label>
                        <div className="buttons">
                            <button type="button" className="btn btn-primary" onClick={() => { this.props.history.push(id > 0 ? '/litter/' + id : "/"); }}>Cancel</button>
                            {this.props.userid == this.props.litter.userId && id > 0 && (
                                <button type="button" className="btn btn-danger" id="delete-btn" onClick={() => { this.props.deleteLitter(id, this) }}>Delete</button>
                            )}
                            {this.props.userid == this.props.litter.userId && (
                                <button type="button" className="btn btn-success" onClick={() => { this.props.saveIndividual(this); }}>Save</button>
                            )}
                        </div>
                    </div>
                </div>;
        }
        else return <div />;
    }
}

export default connect(
    (state: ApplicationState) => state.litter, // Selects which state properties are merged into the component's props
    LitterState.actionCreators                 // Selects which action creators are merged into the component's props
)(EditAnimal) as typeof EditAnimal;
