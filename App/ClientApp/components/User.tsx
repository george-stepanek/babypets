import * as React from 'react';
import { NavLink, Link, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { ApplicationState } from '../store';
import * as UserState from '../store/User';
import { UserData } from '../store/Model';
import * as $ from "jquery";

type UserProps = UserState.UserState & typeof UserState.actionCreators & RouteComponentProps<{ id: string }>;
class User extends React.Component<UserProps, {}> {
    private placeholder_image = "./img/placeholder-500.png";

    componentWillMount() {
        let id = parseInt(this.props.match.params.id) || 0;
        this.props.requestUser(id);
    }

    componentDidMount() {
        var self = this;
        $('#photo-placeholder, .grid-item img, .modal-body img').on('error', function () {
            $(this).attr("src", self.placeholder_image);
        });
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

            if (this.props.isLoading)
                return <div className="loading"><i className="fa fa-spinner fa-spin"></i></div>;
            else
                return <div className="columns-container row user-page">
                    <div className="picture-column col-sm-3">
                        <div className="picture-column-image">
                            <img id="photo-placeholder" src={this.props.user.pictureUrl ? this.props.user.pictureUrl : this.placeholder_image} />
                        </div>
                    </div>
                    <div className="details-column col-sm-3">
                        <b>Name:</b> {this.props.user.name}
                        <br />
                        <b>Email:</b> {this.props.user.email}
                        <br />
                        <b>Phone Number:</b> {this.props.user.phone}
                        <br />
                        <b>Location:</b> {this.props.user.location}
                        <br />
                        <b>Description:</b>
                        <br />
                        <p dangerouslySetInnerHTML={this.formatDescription(this.props.user.description)} />
                    </div>
                    <div className="grid-column col-sm-6">{this.renderGrid()}</div>
                </div>;
        }
        else
            return <div />;
    }

    private formatDescription(description: string) {
        if (description) {
            // sanitise the input to guard against XSS attacks
            description = description.replace(/&/g, '&amp;')
            description = description.replace(/"/g, '&quot;')
            description = description.replace(/'/g, '&#39;')
            description = description.replace(/</g, '&lt;')
            description = description.replace(/>/g, '&gt;');

            description = description.replace(new RegExp('\n', 'g'), '<br/>');
        }
        return { __html: description };
    };

    private renderGrid() {
        if (this.props.user)
            return <div key={this.props.userid}>
                {this.props.user.litters.map(litter =>
                    <div className="grid-item" key={litter.id}>
                        <Link to={'/userlitter/' + litter.id}>
                            <div>
                                <img src={litter.pictureUrl ? litter.pictureUrl : this.placeholder_image} />
                            </div>
                            {litter.breed}
                            <br />
                            {(this.props.user as UserData).location}
                            <br />
                            Available {litter.available}
                            <br />
                            {"$" + Math.floor(litter.price).toFixed(0)}
                        </Link>
                    </div>
                )}
            </div>;
        else
            return <div></div>;
    }
}

export default connect(
    (state: ApplicationState) => state.user, // Selects which state properties are merged into the component's props
    UserState.actionCreators                 // Selects which action creators are merged into the component's props
)(User) as typeof User;
