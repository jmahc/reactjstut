import React from 'react'
import { browserHistory } from 'react-router'

import h from '../helpers'
/*
    StorePicker
*/

var StorePicker = React.createClass({
    goToStore: function(event) {
        event.preventDefault();
        //get data from input
        var storeId = this.refs.storeId.value;
        browserHistory.push('/store/' + storeId);
        
    },
    render: function() {
        return (
            <form className="store-selector" onSubmit={this.goToStore}>
                <h2>Please Enter a Store</h2>
                <input type="text" ref="storeId" required defaultValue={h.getFunName()} />
                <input type="Submit" />
            </form>
        )
    }
});

export default StorePicker;