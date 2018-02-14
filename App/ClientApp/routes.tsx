import * as React from 'react';
import { Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import Litters from './components/Litters';
import Litter from './components/Litter'
import EditLitter from './components/EditLitter'

export const routes = <Layout>
    <Route exact path='/' component={Litters} />
    <Route path='/litters/:id?' component={Litters} />
    <Route path='/litter/:id?' component={Litter} />
    <Route path='/editlitter/:id?' component={EditLitter} />
    <Route path='/createlitter' component={EditLitter} />
</Layout>;
