import * as React from 'react';
import { Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import Litters from './components/Litters';
import Counter from './components/Counter';
import Litter from './components/Litter'

export const routes = <Layout>
    <Route exact path='/' component={Litters} />
    <Route path='/counter' component={Counter} />
    <Route path='/litter/:id?' component={Litter} />
</Layout>;
