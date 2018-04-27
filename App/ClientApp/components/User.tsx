import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { ApplicationState } from '../store';
import * as UserState from '../store/User';
import * as $ from "jquery";
import { FormGroup, FormControl } from 'react-bootstrap'
import * as Validator from 'validator';
import { sendEmail, formatDescription, formatAge, calculateAvailableDates, renderStyle } from './Utils';
import { ThumbLitter } from './ThumbLitter';

const placeholder_image = "./img/placeholder-500.png";

type UserProps = UserState.UserState & typeof UserState.actionCreators & RouteComponentProps<{ id: string }>;
class User extends React.Component<UserProps, {}> {
    constructor(props, context) {
        super(props, context);
        this.handleChange = this.handleChange.bind(this);
        this.state = { value: '' };
    }
    getValidationState() {
        if ((this.state as any).value.length == 0)
            return null;
        else
            return Validator.isEmail((this.state as any).value) ? 'success' : 'error';
    }
    handleChange(e) {
        this.setState({ value: e.target.value });
    }

    componentWillMount() {
        let id = parseInt(this.props.match.params.id) || 0;
        this.props.requestSeller(id);
    }

    public render() {
        if (this.props.seller) {
            calculateAvailableDates(this.props.seller.litters);

            if (this.props.isLoading)
                return <div className="loading"><i className="fa fa-spinner fa-spin"></i></div>;
            else
                return <div className={"columns-container row" + (this.props.location.pathname.indexOf("/user") >= 0 ? " user-page" : "")}>
                    <div className="picture-column col-sm-4">
                        <div className="picture-column-image">
                            <img id="photo-placeholder" src={this.props.seller.pictureUrl ? this.props.seller.pictureUrl : placeholder_image} />
                        </div>
                    </div>
                    <div className="details-column col-sm-4">
                        <p>
                            <b>Name:</b> {this.props.seller.name}
                            <br />
                            {this.props.seller.phone && this.props.seller.phone.length > 0 && (
                                <div>
                                    <b>Phone:</b> {this.props.seller.phone}
                                    <br />
                                </div>
                            )}
                            <b>Region:</b> {this.props.seller.location}
                        </p>
                        <p dangerouslySetInnerHTML={formatDescription(this.props.seller.description)} />
                        {this.props.seller.email && (
                            <div>
                                <b>Contact:</b>
                                <FormGroup validationState={this.getValidationState()}>
                                    <FormControl type="text" id="address" value={(this.state as any).value} placeholder="Your email address" onChange={this.handleChange} />
                                    <FormControl.Feedback />
                                </FormGroup>
                                <textarea id="message" rows={5} className="form-control" placeholder="Your message"></textarea>
                                <div className="buttons">
                                    <button id="send-email" type="button" className="btn btn-primary"
                                        onClick={() => { sendEmail(this.props.sellerid, this.props.seller.email, this); }}
                                        disabled={!Validator.isEmail((this.state as any).value)}
                                        title={Validator.isEmail((this.state as any).value) ? "" : "Email address required"}>
                                        Send Email
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="grid-column col-sm-4">
                        {this.props.seller.litters.map(litter =>
                            <ThumbLitter litter={litter} location={this.props.seller.location} to={this.props.location.pathname.indexOf("/user") >= 0 ? 'userlitter' : 'litter'} />
                        )}
                    </div>
                    {renderStyle(this, this.props.seller.style)}
                </div>;
        }
        else return <div />
    }
}

export default connect(
    (state: ApplicationState) => state.user, // Selects which state properties are merged into the component's props
    UserState.actionCreators                 // Selects which action creators are merged into the component's props
)(User) as typeof User;
