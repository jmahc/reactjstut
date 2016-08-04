import React from 'react';
import { Navigation, browserHistory } from 'react-router';
import h from '../helpers';
import reactMixin from 'react-mixin';
import autobind from 'autobind-decorator';

@autobind
class StorePicker extends React.Component {
    goToStore(e) {
        e.preventDefault();
        // get the data from the input
        var storeId = this.refs.storeId.value;
        //transition from <StorePicker/> to <App/>
        browserHistory.push('/store/' + storeId);
    }

    render() {
        return (
          <form className="store-selector" onSubmit={this.goToStore}>
            <h2>Please Enter A Store</h2>
            <input type="text" ref="storeId" defaultValue={h.getFunName()} required />
            <input type="Submit" />
          </form>
        )
    }
}

reactMixin.onClass(StorePicker, Navigation);

export default StorePicker;
