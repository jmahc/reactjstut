import React from 'react';
import h from '../helpers';
import Catalyst from 'react-catalyst';
import Rebase from 're-base';
import Header from './Header';
import Order from './Order';
import Inventory from './Inventory';
import Fish from './Fish';
import reactMixin from 'react-mixin';
import autobind from 'autobind-decorator';
import config from '../config'
var base = Rebase.createClass(config.databaseURL);

@autobind
class App extends React.Component {
    constructor() {
        super(); // inherits everything from the parent (in this case: React.Component)
        this.state = {
            fishes : {},
            order : {}
        }
    }

    addFish(fish) {
        var timestamp = (new Date()).getTime();
        // update the state object
        this.state.fishes['fish-' + timestamp] = fish;
        // set the state
        this.setState({
            fishes : this.state.fishes
        });
    }

    addToOrder(key) {
        this.state.order[key] = this.state.order[key] + 1 || 1;
        this.setState({
            order : this.state.order
        });
    }

    componentDidMount() {
        base.syncState(this.props.params.storeId + '/fishes', {
            context : this,
            state : 'fishes'
        });
        var localStorageRef = localStorage.getItem('order-' + this.props.params.storeId);

        if(localStorageRef) {
            // update our componenet state if something exists in local storage
            this.setState({
                order: JSON.parse(localStorageRef)
            })
        }
    }

    componentWillUpdate(nextProps, nextState) {
        localStorage.setItem('order-' + this.props.params.storeId, JSON.stringify(nextState.order));
    }

    loadSamples() {
        this.setState({
            fishes : require('../sample-fishes')
        });
    }

    removeFish(key) {
        if(confirm("Are you sure you want to remove this fish?")) {
            delete this.state.fishes[key];
            this.setState({
                fishes : this.state.fishes
            });
        }
    }

    removeFromOrder(key) {
        delete this.state.order[key];
        this.setState({
            order : this.state.order
        });
    }

    renderFish(key) {
        return (
            <Fish key={key} index={key} details={this.state.fishes[key]} addToOrder={this.addToOrder} />
        )
    }

    render() {
        return (
            <div className="catch-of-the-day">
                <div className="menu">
                    <Header tagline="Farmer Fred's Seafood" />
                    <ul className="list-of-fishes">
                        {Object.keys(this.state.fishes).map(this.renderFish)}
                    </ul>
                </div>
                <Order
                    fishes={this.state.fishes}
                    order={this.state.order}
                    removeFromOrder={this.removeFromOrder} />
                <Inventory
                    addFish={this.addFish}
                    loadSamples={this.loadSamples}
                    fishes={this.state.fishes}
                    linkState={this.linkState.bind(this)}
                    removeFish={this.removeFish}
                    {...this.props} />
            </div>
        )
    }
}

reactMixin.onClass(App, Catalyst.LinkedStateMixin);

export default App;
