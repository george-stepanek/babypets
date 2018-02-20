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
        var self = this;
        setTimeout(function () {
            var showPhoto = function () { $('#photo-placeholder').attr("src", $('#photo-url').val() as string); };
            $('#photo-url')
                .change(showPhoto)
                .keyup(showPhoto)
                .bind('paste', showPhoto);

            $('#photo-placeholder, .grid-item img, .modal-body img').on('error', function () {
                $(this).attr("src", self.placeholder_image);
            });
        }, 100); // this delay is needed
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
            var url = window.location.href.replace("edit", "") + "/" + this.props.userid;

            if (this.props.isLoading)
                return <div className="loading"><i className="fa fa-spinner fa-spin"></i></div>;
            else
                return <div className="columns-container row">
                    <div className="picture-column col-sm-4">
                        <div className="picture-column-image">
                            <img id="photo-placeholder" src={this.props.user.pictureUrl ? this.props.user.pictureUrl : this.placeholder_image} />
                        </div>
                        <div>
                            <textarea rows={3} wrap="soft" id="photo-url" placeholder="Paste URL of photo here" defaultValue={this.props.user.pictureUrl}></textarea>
                        </div>
                    </div>
                    <div className="details-column col-sm-4">
                        <b>My User Page:</b>
                        <br />
                        <a href={url} target="_blank">{url}</a>
                        <br />
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
                        <select name="location" id="location" defaultValue={this.props.user.location}>
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
                        <br />
                        <b>Description:</b>
                        <br />
                        <textarea id="description" rows={10} defaultValue={this.props.user.description}></textarea>
                        <div className="buttons">
                            <NavLink exact to={"/"}>
                                <button type="button" className="btn btn-primary">Cancel</button>
                            </NavLink>
                            {this.props.userid == this.props.user.id && (
                                <button type="button" className="btn btn-success" onClick={() => { this.props.saveUser((this.props.user as UserData).id, this) }}>Save</button>
                            )}
                        </div>
                    </div>
                    <div className="grid-column col-sm-4">{this.renderGrid()}</div>
                </div>;
        }
        else
            return <div />;
    }

    private renderGrid() {
        if (this.props.user)
            return <div key={this.props.userid}>
                {this.props.user.litters.map(litter =>
                    <div className="grid-item" key={litter.id}>
                        <Link to={'/editlitter/' + litter.id}>
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
)(EditUser) as typeof EditUser;
