import * as React from 'react';
import { Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { About } from './components/About';
import Litters from './components/Litters';
import Litter from './components/Litter'
import EditLitter from './components/EditLitter'
import EditUser from './components/EditUser'
import User from './components/User'

export const routes = <Layout>
    <Route exact path='/' component={Litters} />
    <Route path='/about' component={About} />
    <Route path='/litters/:id?' component={Litters} />
    <Route path='/litter/:id?' component={Litter} />
    <Route path='/editlitter/:id?' component={EditLitter} />
    <Route path='/createlitter' component={EditLitter} />
    <Route path='/edituser' component={EditUser} />
    <Route path='/user/:id?' component={User} />
    <Route path='/seller/:id?' component={User} />
    <Route path='/userlitter/:id?' component={Litter} />
    <Route path='/userlitters/:id?' component={Litters} />
    <Route path='//userlitters/:id?' component={Litters} />
</Layout>;
