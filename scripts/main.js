var React          = require('react');
var ReactDOM       = require('react-dom');
var ReactRouter    = require('react-router');
var Router         = ReactRouter.Router;
var Route          = ReactRouter.Route;
var Navigation     = ReactRouter.Navigation;
var browserHistory = ReactRouter.browserHistory;
// Helpers
var h              = require('./helpers');
// Firebase
var Rebase         = require('re-base');
var base           = Rebase.createClass('https://catch-of-the-day-9b18e.firebaseio.com/');
/*
    App
*/
var App = React.createClass({
    getInitialState : function() {
        return {
            fishes : {},
            order : {}
        }
    },
    componentDidMount : function() {
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
    },
    componentWillUpdate : function(nextProps, nextState) {
        localStorage.setItem('order-' + this.props.params.storeId, JSON.stringify(nextState.order));
    },
    addToOrder : function(key) {
        this.state.order[key] = this.state.order[key] + 1 || 1;
        this.setState({ order : this.state.order })
    },
    addFish : function(fish) {
        var timestamp = (new Date()).getTime();
        // update the state object
        this.state.fishes['fish-' + timestamp] = fish;
        // set the state
        this.setState({ fishes : this.state.fishes });
    },
    loadSamples : function() {
        this.setState({
            fishes: require('./sample-fishes')
        });
    },
    renderFish : function(key) {
        return (
            <Fish key={key} index={key} details={this.state.fishes[key]} addToOrder={this.addToOrder} />
        )
    },
    render: function() {
        return (
            <div className="catch-of-the-day">
                <div className="menu">
                    <Header tagline="Farmer Fred's Seafood" />
                    <ul className="list-of-fishes">
                        {Object.keys(this.state.fishes).map(this.renderFish)}
                    </ul>
                </div>
                <Order fishes={this.state.fishes} order={this.state.order} />
                <Inventory addFish={this.addFish} loadSamples={this.loadSamples} />
            </div>
        );
    }
});

var Fish = React.createClass({
    onButtonClick : function() {
        console.log("Going to add the fish: ", this.props.index);
        this.props.addToOrder(this.props.index); // its the key
    },
    render: function() {
        var details = this.props.details;
        var isAvailable = (details.status === 'available' ? true : false);
        var buttonText = (isAvailable ? 'Add To Order' : 'Sold Out!');
        return (
            <li className="menu-fish">
                <img src={details.image} alt="{details.name}" />
                <h3 className="fish-name">
                    {details.name}
                    <span className="price">{h.formatPrice(details.price)}</span>
                </h3>
                <p>{details.desc}</p>
                <button disabled={!isAvailable} onClick={this.onButtonClick}>{buttonText}</button>
            </li>
        );
    }
});


/*
Add fish form
*/
var AddFishForm = React.createClass({
    createFish : function(e) {
        e.preventDefault();

        // takes form data and creates an object
        var fish = {
            name : this.refs.name.value,
            price : this.refs.price.value,
            status : this.refs.status.value,
            desc : this.refs.desc.value,
            image : this.refs.image.value
        }
        console.log(fish);

        // adding the new object (fish) to the App State
        this.props.addFish(fish);
        this.refs.fishForm.reset();
    },
    render: function() {
        return (
            <form className="fish-edit" ref="fishForm" onSubmit={this.createFish}>
                <input type="text" ref="name" placeholder="Fish Name"/>
                <input type="text" ref="price" placeholder="Fish Price" />
                <select ref="status">
                    <option value="available">Fresh!</option>
                    <option value="unavailable">Sold Out!</option>
                </select>
                <textarea type="text" ref="desc" placeholder="Desc"></textarea>
                <input type="text" ref="image" placeholder="URL to Image" />
                <button type="submit">+ Add Item </button>
            </form>
        );
    }

});



/*
Header
*/
var Header = React.createClass({
    render: function() {
        return (
            <header className="top">
                <h1>
                    Catch
                    <span className="ofThe">
                        <span className="of">of</span>
                        <span className="the">the</span>
                    </span>
                    day
                </h1>
                <h3 className="tagline">
                    <span>{this.props.tagline}</span>
                </h3>
            </header>
        );
    }
});

/*
    Order
*/
var Order = React.createClass({
    renderOrder : function(key) {
        var fish = this.props.fishes[key];
        var count = this.props.order[key];

        if(!fish) {
            return (
                <li key={key}>Sorry, no longer available!</li>
            )
        }
        return (
            <li key={key}>
                {count}lbs.
                {fish.name}
                <span className="price">{h.formatPrice(count * fish.price)}</span>
            </li>
        )
    },
    render: function() {
        var orderIds = Object.keys(this.props.order);

        var total = orderIds.reduce((prevTotal, key) => {
            var fish = this.props.fishes[key];
            var count = this.props.order[key];
            var isAvailable = fish && fish.status === 'available';

            if (fish && isAvailable) {
                return prevTotal + (count * parseInt(fish.price) || 0);
            }
            return prevTotal;
        }, 0); // starting value so first time around, the value will be 0
        return (
            <div className="order-wrap">
                <h2 className="order-title">Your Order</h2>
                <ul className="order">
                    {orderIds.map(this.renderOrder)}
                    <li className="total">
                    <strong>Total:</strong>
                    {h.formatPrice(total)}
                </li>
                </ul>
            </div>
        );
    }
});

/*
    Inventory
*/
var Inventory = React.createClass({
    render: function() {
        return (
            <div>
                <h2>Inventory</h2>
                <AddFishForm {...this.props} />
                <button onClick={this.props.loadSamples}>Load Sample Fishes</button>
            </div>
        );
    }
});



/* <StorePicker/> */
var StorePicker = React.createClass({
    mixins : [Navigation],
    goToStore : function(e) {
        e.preventDefault();
        // get the data from the input
        var storeId = this.refs.storeId.value;
        //transition from <StorePicker/> to <App/>
        browserHistory.push('/store/' + storeId);
    },
    render: function() {
        return (
          <form className="store-selector" onSubmit={this.goToStore}>
            <h2>Please Enter A Store</h2>
            <input type="text" ref="storeId" defaultValue={h.getFunName()} required />
            <input type="Submit" />
          </form>
        )
    }
});

/*
    Not Found
*/
var NotFound = React.createClass({
    render: function() {
        return (
            <h1>Not found!</h1>
        );
    }
});

/*
    Routes
*/
var routes = (
    <Router history= {browserHistory}>
        <Route path="/" component={StorePicker} />
        <Route path="/store/:storeId" component={App} />
        <Route path="*" component={NotFound} />
    </Router>
)

ReactDOM.render(routes, document.querySelector("#main"));