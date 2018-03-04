import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { ApplicationState } from '../store';
import * as UserState from '../store/User';
import * as $ from "jquery";
import { FormGroup, FormControl } from 'react-bootstrap'
import * as Validator from 'validator';
import { sendEmail, formatDescription } from './Utils';

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
            this.props.seller.litters.forEach(litter => {
                var available = new Date(litter.bornOn);
                available.setTime(available.getTime() + litter.weeksToWean * 7 * 24 * 60 * 60 * 1000);
                litter.available = ('0' + available.getDate()).slice(-2) +
                    "/" + ('0' + (available.getMonth() + 1)).slice(-2) +
                    "/" + available.getFullYear().toString().substring(2);
            });

            if (this.props.isLoading)
                return <div className="loading"><i className="fa fa-spinner fa-spin"></i></div>;
            else
                return <div className={"columns-container row" + (window.location.href.indexOf("/user") > 0 ? " user-page" : "")}>
                    <div className="picture-column col-sm-4">
                        <div className="picture-column-image">
                            <img id="photo-placeholder" src={this.props.seller.pictureUrl ? this.props.seller.pictureUrl : placeholder_image} />
                        </div>
                    </div>
                    <div className="details-column col-sm-4">
                        <b>Name:</b> {this.props.seller.name}
                        <br />
                        <b>Phone Number:</b> {this.props.seller.phone}
                        <br />
                        <b>Region:</b> {this.props.seller.location}
                        <br />
                        <b>Description:</b>
                        <br />
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
                                    <button id="send-email" type="button" className="btn btn-primary" onClick={() => { sendEmail(this.props.sellerid, this.props.seller.email, this); }}
                                        disabled={!Validator.isEmail((this.state as any).value)}>Send Email</button>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="grid-column col-sm-4">{this.renderGrid()}</div>
                </div>;
        }
        else return <div />
    }

    private renderGrid() {
        return <div key={this.props.userid}>
            {this.props.seller.litters.map(litter =>
                <div className="grid-item" key={litter.id}>
                    <Link to={(window.location.href.indexOf("/user") > 0 ? '/userlitter/' : '/litter/') + litter.id}>
                        <div>
                            <img src={litter.pictureUrl ? litter.pictureUrl.replace('/upload/', '/upload/c_fill,h_128,w_128/') : placeholder_image} />
                        </div>
                        {litter.breed}
                        <br />
                        {this.props.seller.location}
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
)(User) as typeof User;