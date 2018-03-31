import * as React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { ApplicationState } from '../store';
import * as UserState from '../store/User';
import * as $ from "jquery";

type UserProps = UserState.UserState & typeof UserState.actionCreators;
class NavMenu extends React.Component<UserProps, {}> {
    public componentWillMount() {
        let token = (typeof window !== 'undefined') ? $("meta[property='token']").attr('content') : undefined;
        if (token) this.props.loggedIn(token);
    }

    public componentDidMount() {
        var navMain: any = $(".navbar-collapse");
        navMain.on("click", "a", null, function () { navMain.collapse('hide'); });
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
                    <span className='navbar-brand'>boop</span>
                </div>
                <div className='clearfix'></div>
                <div className='navbar-collapse collapse'>
                    <ul className='nav navbar-nav'>
                        <li>
                            <Link to={ '/' }>
                                <span className='glyphicon glyphicon-globe'></span> See All Animals
                            </Link>
                        </li>
                        {this.props.user && (
                            <li>
                                <Link to={'/createlitter'}>
                                    <span className="glyphicon"><i className="fa fa-share-alt"></i></span> Sell A Litter
                                </Link>
                            </li>
                        )}
                        {this.props.user && (
                            <li>
                                <Link to={'/createanimal'}>
                                    <span className="glyphicon"><i className="fa fa-paw"></i></span> Sell One Animal
                                </Link>
                            </li>
                        )}
                        {this.props.user && (
                            <li>
                                <Link to={'/edituser'}>
                                    <span className='glyphicon glyphicon-user'></span> My Stuff
                                </Link>
                            </li>
                        )}
                        {this.props.user && (
                            <li>
                                <a href={'/logout'}>
                                    <span className='glyphicon glyphicon-log-out'></span> Sign Out
                                </a>
                            </li>
                        )}
                        {!this.props.user && (
                            <li>
                                <a href={'/login'}>
                                    <span className="glyphicon"><i className="fa fa-facebook"></i></span> Sign In Via Facebook
                                </a>
                            </li>
                        )}
                        <li>
                            <Link to={'/about'}>
                                <span className='glyphicon glyphicon-info-sign'></span> About Boop
                            </Link>
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
