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
        this.props.requestUser(response.id, response.name, response.email);
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
                            <NavLink exact to={ '/' } activeClassName='disable'>
                                <span className='glyphicon glyphicon-globe'></span> All Litters
                            </NavLink>
                        </li>
                        {this.props.user && (
                            <li>
                                <NavLink to={'/createlitter'} activeClassName='disable'>
                                    <span className='glyphicon glyphicon-plus'></span> New Litter
                            </NavLink>
                            </li>
                        )}
                        {this.props.user && (
                            <li>
                                <NavLink to={'/edituser'} activeClassName='disable'>
                                    <span className='glyphicon glyphicon-user'></span> My Stuff
                            </NavLink>
                            </li>
                        )}
                        {this.props.user && (
                            <li>
                                <div className='facebook-login' onClick={() => { this.props.signOut() } }>
                                    <span className='glyphicon glyphicon-log-out'></span> Sign Out
                                </div>
                            </li>
                        )}
                        {!this.props.user && (
                            <li>
                                <FacebookLogin
                                    appId={window.location.href.indexOf("localhost") > 0 ? "757036444505582" : "335274000314919"}  
                                    autoLoad={true}
                                    fields="name,email,picture"
                                    icon="fa-facebook"
                                    cssClass="facebook-login"
                                    textButton=" Sign In"
                                    redirectUri="https://babypets-10000.appspot.com/"
                                    callback={this.responseFacebook} />
                            </li>
                        )}
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

