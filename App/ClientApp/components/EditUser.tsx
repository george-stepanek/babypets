﻿import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { ApplicationState } from '../store';
import * as UserState from '../store/User';
import * as $ from "jquery";
import { FormGroup, FormControl } from 'react-bootstrap'
import * as Validator from 'validator';
import { photoUploader } from './Utils'

const placeholder_image = "./img/placeholder-500.png";

type UserProps = UserState.UserState & typeof UserState.actionCreators & RouteComponentProps<{ }>;
class EditUser extends React.Component<UserProps, {}> {
    constructor(props, context) {
        super(props, context);
        this.handleChange = this.handleChange.bind(this);
        this.state = { value: "admin@boop.co.nz" };
    }
    getValidationState() {
        return Validator.isEmail((this.state as any).value) ? null : 'error';
    }
    handleChange(e) {
        this.setState({ value: e.target.value });
    }

    componentWillMount() {
        if (this.props.userid)
            this.props.requestUser(this.props.userid as number, this);
    }

    public render() {
        if (this.props.user) {
            this.props.user.litters.forEach(litter => {
                var available = new Date(litter.bornOn);
                available.setTime(available.getTime() + litter.weeksToWean * 7 * 24 * 60 * 60 * 1000);
                litter.available = ('0' + available.getDate()).slice(-2) +
                    "/" + ('0' + (available.getMonth() + 1)).slice(-2) +
                    "/" + available.getFullYear().toString().substring(2);
            });
            var url = "http://boop.co.nz/userlitters/" + this.props.userid;

            if (this.props.isLoading)
                return <div className="loading"><i className="fa fa-spinner fa-spin"></i></div>;
            else
                return <div className="columns-container row">
                    <div className="picture-column col-sm-4">
                        <div className="picture-column-image">
                            <img id="photo-placeholder" src={this.props.user.pictureUrl ? this.props.user.pictureUrl : placeholder_image} />
                        </div>
                        <input id="photo-url" type="hidden" defaultValue={this.props.user.pictureUrl}></input>
                        <div className="buttons">
                            {this.props.userid == this.props.user.id && (
                                <button type="button" className="btn btn-primary" onClick={() => { photoUploader('photo-url', 'photo-placeholder') }}>Upload Photo</button>
                            )}
                        </div>
                    </div>
                    <div className="details-column col-sm-4">
                        <b>Name:</b>
                        <input id="name" className="form-control" defaultValue={this.props.user.name}></input>
                        <b>Email (required):</b>
                        <FormGroup validationState={this.getValidationState()}>
                            <FormControl type="text" id="email" value={(this.state as any).value} onChange={this.handleChange} />
                            <FormControl.Feedback />
                        </FormGroup>
                        <b>Phone number:</b>
                        <input id="phone" className="form-control" defaultValue={this.props.user.phone}></input>
                        <b>Bank account number (to accept deposits):</b>
                        <input id="bankAccount" className="form-control" placeholder="XX-XXXX-XXXXXXX-XX" defaultValue={this.props.user.bankAccount}></input>
                        <b>Region:</b>
                        <select name="location" id="location" className="form-control" defaultValue={this.props.user.location}>
                            <option value=""></option>
                            <option value="Northland">Northland</option>
                            <option value="Auckland">Auckland</option>
                            <option value="Waikato">Waikato</option>
                            <option value="Bay of Plenty">Bay of Plenty</option>
                            <option value="Gisborne">Gisborne</option>
                            <option value="Hawke's Bay">Hawke's Bay</option>
                            <option value="Taranaki">Taranaki</option>
                            <option value="Manawatu-Wanganui">Manawatu-Wanganui</option>
                            <option value="Wellington">Wellington</option>
                            <option value="Tasman">Tasman</option>
                            <option value="Nelson">Nelson</option>
                            <option value="Marlborough">Marlborough</option>
                            <option value="West Coast">West Coast</option>
                            <option value="Canterbury">Canterbury</option>
                            <option value="Otago">Otago</option>
                            <option value="Southland">Southland</option>
                        </select>
                        <b>Custom css styles for <a href={url} target="_blank">your gallery</a>:</b>
                        <textarea id="style" rows={5} className="form-control" defaultValue={this.props.user.style}
                            placeholder="Use this if you want to embed the gallery in your own website."></textarea>
                        <b>Description:</b>
                        <textarea id="description" rows={5} className="form-control" defaultValue={this.props.user.description}></textarea>
                        <div className="buttons">
                            <button type="button" className="btn btn-primary" onClick={() => { this.props.history.push('/seller/' + this.props.userid); }}>Cancel</button>
                            {this.props.userid == this.props.user.id && (
                                <button type="button" className="btn btn-success" onClick={() => { this.props.saveUser(this.props.user.id, this) }}
                                    id='save-button' disabled={!Validator.isEmail((this.state as any).value)}>Save</button>
                            )}
                        </div>
                    </div>
                    <div className="grid-column col-sm-4">{this.renderGrid()}</div>
                </div>;
        }
        else return <div />
    }

    private renderGrid() {
        return <div key={this.props.userid}>
            {this.props.user.litters.map(litter =>
                <div className="grid-item" key={litter.id}>
                    <Link to={'/editlitter/' + litter.id}>
                        <div>
                            <img src={litter.pictureUrl ? litter.pictureUrl.replace('/upload/', '/upload/c_fill,h_128,w_128/') : placeholder_image} />
                        </div>
                        {litter.breed}
                        <br />
                        {this.props.user.location}
                        <br />
                        available {litter.available}
                        <br />
                        {"$" + Math.floor(litter.price).toFixed(0)}
                    </Link>
                </div>
            )}
        </div>;
    }
}

export default connect(
    (state: ApplicationState) => state.user, // Selects which state properties are merged into the component's props
    UserState.actionCreators                 // Selects which action creators are merged into the component's props
)(EditUser) as typeof EditUser;