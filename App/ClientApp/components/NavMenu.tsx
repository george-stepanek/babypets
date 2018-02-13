import * as React from 'react';
import { Link, NavLink, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { ApplicationState } from '../store';
import * as UserState from '../store/User';
import * as $ from "jquery";
import FacebookLogin from 'react-facebook-login';


type UserProps = UserState.UserState & typeof UserState.actionCreators;
class NavMenu extends React.Component<UserProps, {}> {
    private responseFacebook = (response: any) => {
        this.props.requestUser(response.id);
        /*
        accessToken:"EAAEw7gZBw8icBAN8GeBNUJT2j87XHd2m45sBMWLfdB9BBBJKXTmzJGAXZAOW35fO9MMmNjbyNajyUHpgnZA6oWLBxfbWMLe1rhOIV0zP37RoIUyxMkCieERuyfhZBFGt90K3pWcANx2M49eUu2Qf1UaZBwE4TDlafuR4slOEjNZAfTnHALEKKjo2Vhp5rGSvIZBi1C0g8CaRQZDZD"
        email:"g.stepanek.nz@gmail.com"
        expiresIn:6386
        id:"199359850810789"
        name:"George Stepanek"
        picture:data:{height: 50, is_silhouette: false, url: "https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/2174…g?oh=39851288aac8d6cc69a92c227734102d&oe=5B06673C", width: 50}
        signedRequest:"YjdKCQrRh5VoTjmkyH7JYYNhOK5tLdYWuVeZQ3NGs-8.eyJhbGdvcml0aG0iOiJITUFDLVNIQTI1NiIsImNvZGUiOiJBUURESWJwQ0phRUY5Q1BHYmdvMGZpakgxajctYUpaQWFGSlkxU1Y4RlR0WFVRMkVKbmFGM3Baa20tQjRERGhOTDVDZ0hXT0ptaWFzcTdzanJkTl9XbFFuVTdzazhaZkkyUU1RN3RMbHd1Q0x5MDhyLWUxa0EwS2JuRzcyRmtmVEdaRTQ2RVB3VUpFZF9NTjNjSGgyVUhJUy1GM19VWGFqeWtNdWNyMkhPQkt6M1NOU3g4UFdaNkRFSVNWTjJON1FpWWlOUVFZZWk1Qm5OR0gwSEswZHFneThBRkpocVhrd1Job2F4eVkxT2h6WVk3Qmt2clpMWUlDYjViR0F3ZC1TQ0VwM0pmVFhodXhGaG81R3c0cmZtYWNNV2ZLdGFOSGoyM204bjNtUF9KNzBlbmhGdElBV3E5RW0xWHRJODZEZFl0cEZjODI1cE8ySE1mSGF4MEFsQjRUZCIsImlzc3VlZF9hdCI6MTUxODUwMjQxNCwidXNlcl9pZCI6IjE5OTM1OTg1MDgxMDc4OSJ9"
        userID:"199359850810789"
        */
    }

    public render() {
        return <div className='main-nav'>
                <div className='navbar navbar-inverse'>
                <div className='navbar-header'>
                    <button type='button' className='navbar-toggle' data-toggle='collapse' data-target='.navbar-collapse'>
                        <span className='sr-only'>Toggle navigation</span>
                        <span className='icon-bar'></span>
                        <span className='icon-bar'></span>
                        <span className='icon-bar'></span>
                    </button>
                    <Link className='navbar-brand' to={'/'}>Boop</Link>
                </div>
                <div className='clearfix'></div>
                <div className='navbar-collapse collapse'>
                    <ul className='nav navbar-nav'>
                        <li>
                            <NavLink exact to={ '/' } activeClassName='active'>
                                <span className='glyphicon glyphicon-globe'></span> All Litters
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to={'/mylitters'} activeClassName='active'>
                                <span className='glyphicon glyphicon-user'></span> My Litters
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to={'/createlitter'} activeClassName='active'>
                                <span className='glyphicon glyphicon-plus'></span> New Litter
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to={'/settings'} activeClassName='active'>
                                <span className='glyphicon glyphicon-cog'></span> {this.props.user ? this.props.user.name : ""}
                            </NavLink>
                        </li>
                        <li>
                            <FacebookLogin
                                appId="335274000314919"
                                autoLoad={false}
                                fields="name,email,picture"
                                icon="fa-facebook"
                                cssClass="facebook-login"
                                textButton=" Sign In"
                                callback={this.responseFacebook} />
                        </li>
                    </ul>
                </div>
            </div>
        </div>;
    }
}

export default connect(
    (state: ApplicationState) => state.user, // Selects which state properties are merged into the component's props
    UserState.actionCreators                 // Selects which action creators are merged into the component's props
)(NavMenu) as typeof NavMenu;

