import React from 'react'
import Header from './Header.js'
import Fish from './Fish.js'
import Inventory from './Inventory.js'
import Order from './Order.js'
import h from '../helpers';
import Catalyst from 'react-catalyst';

// Firebase
import Rebase from 're-base';
var base = Rebase.createClass('https://luminous-fire-90.firebaseio.com/');


/*
App
*/
var App = React.createClass({
    mixins: [Catalyst.LinkedStateMixin],
    getInitialState : function() {
        return {
            fishes: {},
            order: {} 
        }   
    },
    componentDidMount : function() {
        base.syncState(this.props.params.storeId + '/fishes', {
            context : this,
            state : 'fishes'
        });
        
        var localStorageRef = localStorage.getItem('order-' + this.props.params.storeId);
        if (localStorageRef) {
            this.setState({
                order : JSON.parse(localStorageRef)
            });
        }
    },
    componentWillUpdate : function(nextProps, nextState) {
        localStorage.setItem('order-' + this.props.params.storeId, JSON.stringify(nextState.order));  
    },
    addToOrder : function(key) {
      this.state.order[key] = this.state.order[key] + 1 || 1;
      this.setState({ order : this.state.order })  
    },
    removeFromOrder : function(key) {
        delete this.state.order[key];
        this.setState({
            order: this.state.order
        });
    },
    addFish: function(fish) {
        var timeStamp = (new Date()).getTime();
        //update the state object
        this.state.fishes['fish-' + timeStamp] = fish;
        //set the state
        this.setState({ fishes : this.state.fishes });
    },
    removeFish : function(key) {
        if(confirm("Are you sure you want to remove this fish?")) {
            this.state.fishes[key] = null;
            this.setState({
                fishes : this.state.fishes
            });   
        }

    }, 
    loadSamples: function() {
        this.setState({
            fishes: require('../sample-fishes')
        })  
    },
    renderFish : function(key) {
        return <Fish key={key} index={key} details={this.state.fishes[key]} addToOrder={this.addToOrder} />
    },
    render : function(){
       return (
           <div className="catch-of-the-day">
            <div className="menu">
                <Header tagline="Fresh Seafood Market" />
                <ul className="list-of-fishes">
                    {Object.keys(this.state.fishes).map(this.renderFish)}
                </ul>
            </div>
            <Order fishes={this.state.fishes} removeFromOrder={this.removeFromOrder} order={this.state.order} />
            <Inventory addFish={this.addFish} removeFish={this.removeFish} loadSamples={this.loadSamples} 
                fishes={this.state.fishes} linkState={this.linkState}/>
           </div>
       )
   }
});

export default App;