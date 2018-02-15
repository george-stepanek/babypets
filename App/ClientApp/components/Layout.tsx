import * as React from 'react';
import NavMenu from './NavMenu';
import * as UserState from '../store/User';

export class Layout extends React.Component<{}, {}> {
    public render() {
        return <div className='container-fluid'>
            <div className='row'>
                <div className='col-sm-3'>
                    <NavMenu requestUser={UserState.actionCreators.requestUser} saveUser={UserState.actionCreators.saveUser} signOut={UserState.actionCreators.signOut} />
                </div>
                <div className='col-sm-9'>
                    { this.props.children }
                </div>
            </div>
        </div>;
    }
}
