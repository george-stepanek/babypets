import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { ApplicationState } from '../store';
import * as UserState from '../store/User';
import * as $ from "jquery";
declare var cloudinary: any;

const placeholder_image = "./img/placeholder-500.png";

type UserProps = UserState.UserState & typeof UserState.actionCreators & RouteComponentProps<{ }>;
class EditUser extends React.Component<UserProps, {}> {
    componentWillMount() {
        if(this.props.userid)
            this.props.requestUser(this.props.userid as number);
    }

    private photoUploader() {
        cloudinary.openUploadWidget({
                cloud_name: 'boop-co-nz',
                upload_preset: 'f8xxhe3n',
                sources: ['local', 'url', 'facebook', 'instagram'],
                theme: "white",
                multiple: false,
                resource_type: "image"
            },
            function (error: any, result: any) {
                if (error) { console.log(error.message); }
                else {
                    $('#photo-url').val(result[0].secure_url);
                    $('#photo-placeholder').attr("src", result[0].secure_url);
                }
            }
        );
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
            var url = "http://boop.co.nz/user/" + this.props.userid;

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
                                <button type="button" className="btn btn-primary" onClick={this.photoUploader}>Upload Photo</button>
                            )}
                        </div>
                    </div>
                    <div className="details-column col-sm-4">
                        <b>My user page:</b>
                        <p><a href={url} target="_blank">{url}</a></p>
                        <b>Name:</b>
                        <input id="name" className="form-control" defaultValue={this.props.user.name}></input>
                        <b>Email:</b>
                        <input id="email" className="form-control" defaultValue={this.props.user.email}></input>
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
                        <b>Description:</b>
                        <textarea id="description" rows={10} className="form-control" defaultValue={this.props.user.description}></textarea>
                        <div className="buttons">
                            <button type="button" className="btn btn-primary" onClick={() => { this.props.history.push('/seller/' + this.props.userid); }}>Cancel</button>
                            {this.props.userid == this.props.user.id && (
                                <button type="button" className="btn btn-success" onClick={() => { this.props.saveUser(this.props.user.id, this) }}>Save</button>
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