import * as React from 'react';
import NavMenu from './NavMenu';
import * as UserState from '../store/User';

export class Layout extends React.Component<{}, {}> {
    public render() {
        var isUserPage = window.location.href.indexOf("/user") > 0;
        return <div className='container-fluid'>
            <div className='row'>
                <div className={isUserPage ? "hide-navbar" : "col-sm-3"}>
                    <NavMenu requestUser={UserState.actionCreators.requestUser} saveUser={UserState.actionCreators.saveUser} signOut={UserState.actionCreators.signOut} isLoading={false} />
                </div>
                <div className={isUserPage ? "col-sm-12" : "col-sm-9"}>
                    { this.props.children }
                </div>
            </div>
        </div>;
    }
}
