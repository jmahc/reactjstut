import React from 'react';
import { Router, Route, browserHistory } from 'react-router';
import App from './App';
import StorePicker from './StorePicker';
import NotFound from './NotFound';

let Routes = (
    <Router history= {browserHistory}>
        <Route path="/" component={StorePicker} />
        <Route path="/store/:storeId" component={App} />
        <Route path="*" component={NotFound} />
    </Router>
)

export default Routes;
