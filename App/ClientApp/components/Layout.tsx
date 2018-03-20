import * as React from 'react';
import * as ReactGA from 'react-ga';
import NavMenu from './NavMenu';
import * as UserState from '../store/User';

export class Layout extends React.Component<{}, {}> {
    tracking() {
        if (window.location.host.search("localhost") < 0) {
            ReactGA.pageview(window.location.pathname + window.location.search);
        }
    }
    componentDidMount() {
        ReactGA.initialize('UA-115890616-1');
        this.tracking();
    }
    componentDidUpdate(prevProps, prevState) {
        this.tracking();
    }

    public render() {
        var isUserPage = window.location.href.indexOf("/user") > 0;
        return <div className='container-fluid'>
            <div className='row'>
                <div className={isUserPage ? "hide-navbar" : "col-sm-3"}>
                    <NavMenu loggedIn={UserState.actionCreators.loggedIn} requestUser={UserState.actionCreators.requestUser}
                        saveUser={UserState.actionCreators.saveUser} requestSeller={UserState.actionCreators.requestSeller} isLoading={false} />
                </div>
                <div className={isUserPage ? "col-sm-12" : "col-sm-9"}>
                    { this.props.children }
                </div>
            </div>
        </div>;
    }
}