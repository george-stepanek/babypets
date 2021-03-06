﻿import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { ApplicationState } from '../store';
import * as UserState from '../store/User';
import * as $ from "jquery";
import { FormGroup, FormControl } from 'react-bootstrap'
import * as Validator from 'validator';
import { photoUploader, formatAge, calculateAvailableDates, locationSelect } from './Utils';
import { ThumbLitter } from './ThumbLitter';

const placeholder_image = "./img/placeholder-500.png";

type UserProps = UserState.UserState & typeof UserState.actionCreators & RouteComponentProps<{ }>;
class EditUser extends React.Component<UserProps, {}> {
    constructor(props, context) {
        super(props, context);
        this.handleChange = this.handleChange.bind(this);
        this.state = { value: "g.stepanek.nz@gmail.com" };
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
            calculateAvailableDates(this.props.user.litters);
            var url = "https://boopnz.azurewebsites.net/userlitters/" + this.props.userid;

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
                        <b>Phone number (optional):</b>
                        <input id="phone" className="form-control" defaultValue={this.props.user.phone}></input>
                        <b>Bank account number (to accept deposits):</b>
                        <input id="bankAccount" className="form-control" placeholder="XX-XXXX-XXXXXXX-XX" defaultValue={this.props.user.bankAccount}></input>
                        <b>Region:</b>
                        {locationSelect(null, this.props.user.location)}
                        <b>Custom css styles for <a href={url} target="_blank">your gallery</a>:</b>
                        <textarea id="style" rows={5} className="form-control" defaultValue={this.props.user.style}
                            placeholder="Use this if you want to embed the gallery in your own website."></textarea>
                        <b>Description:</b>
                        <textarea id="description" rows={5} className="form-control" defaultValue={this.props.user.description}></textarea>
                        <div className="buttons">
                            <button type="button" className="btn btn-primary" onClick={() => { this.props.history.push('/seller/' + this.props.userid); }}>Cancel</button>
                            {this.props.userid == this.props.user.id && (
                                <button type="button" className="btn btn-success" id='save-button'
                                    onClick={() => { this.props.saveUser(this.props.user.id, this) }}
                                    disabled={!Validator.isEmail((this.state as any).value)}
                                    title={Validator.isEmail((this.state as any).value) ? "" : "Email address required"}>
                                    Save
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="grid-column col-sm-4">
                        {this.props.user.litters.map(litter =>
                            <ThumbLitter litter={litter} location={this.props.user.location} to={litter.isIndividual ? 'editanimal' : 'editlitter'} />
                        )}
                    </div>
                </div>;
        }
        else return <div />
    }
}

export default connect(
    (state: ApplicationState) => state.user, // Selects which state properties are merged into the component's props
    UserState.actionCreators                 // Selects which action creators are merged into the component's props
)(EditUser) as typeof EditUser;
