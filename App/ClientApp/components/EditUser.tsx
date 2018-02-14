import * as React from 'react';
import { NavLink, Link, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { ApplicationState } from '../store';
import * as UserState from '../store/User';
import { UserData } from '../store/Model';
import * as $ from "jquery";

type UserProps = UserState.UserState & typeof UserState.actionCreators & RouteComponentProps<{ }>;
class EditUser extends React.Component<UserProps, {}> {
    private placeholder_image = "./img/placeholder-500.png";

    componentWillMount() {
        if(this.props.userid)
            this.props.requestUser(this.props.userid as number);
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
        if (this.props.user) {
            return <div className="litter-grid row">
                <div className="litter-pic col-sm-4">
                    <div className="litter-pic-content">
                        <img id="photo-placeholder" src={this.props.user.pictureUrl ? this.props.user.pictureUrl : this.placeholder_image} />
                    </div>
                    <div>
                        <textarea rows={3} wrap="soft" id="photo-url" placeholder="Paste URL of photo here" defaultValue={this.props.user.pictureUrl}></textarea>
                    </div>
                </div>
                <div className="litter-details col-sm-4">
                    <b>Name:</b>
                    <br />
                    <input id="name" defaultValue={this.props.user.name}></input>
                    <br />
                    <b>Email:</b>
                    <br />
                    <input id="email" defaultValue={this.props.user.email}></input>
                    <br />
                    <b>Phone Number:</b>
                    <br />
                    <input id="phone" defaultValue={this.props.user.phone}></input>
                    <br />
                    <b>Location:</b>
                    <br />
                    <input id="location" defaultValue={this.props.user.location}></input>
                    <br />
                    <b>Description:</b>
                    <br />
                    <textarea id="description" rows={10} defaultValue={this.props.user.description}></textarea>
                    <div className="buttons">
                        <NavLink exact to={"/litters/" + this.props.userid}>
                            <button type="button" className="btn btn-default">Cancel</button>
                        </NavLink>
                        {this.props.userid == this.props.user.id && (
                            <button type="button" className="btn btn-success" onClick={() => { this.props.saveUser((this.props.user as UserData).id, this) }}>Save</button>
                        )}
                    </div>
                </div>
                <div className="col-sm-4">
                </div>
            </div>
        }
        else
            return <div />;
    }
}

export default connect(
    (state: ApplicationState) => state.user, // Selects which state properties are merged into the component's props
    UserState.actionCreators                 // Selects which action creators are merged into the component's props
)(EditUser) as typeof EditUser;
