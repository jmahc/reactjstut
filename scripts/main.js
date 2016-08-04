import React from 'react';
import ReactDOM from 'react-dom';
import ReactRouter from 'react-router';

/*
    Import Components
*/
import App from './components/App';

/*
    Import Routes
*/
import Routes from './components/Routes';

ReactDOM.render(Routes, document.querySelector("#main"));
