import React from 'react';
import h from '../helpers';
import AddFishForm from './AddFishForm';
import Fish from './Fish';
import Firebase from 'firebase';
import autobind from 'autobind-decorator';
import config from '../config'

@autobind
class Inventory extends React.Component {
    constructor() {
        super();
        this.state = {
            uid : ''
        }
        this.authenticate = this.authenticate.bind(this);
    }

    authenticate(providerName) {
        let auth = firebase.auth();
        let provider = h.determineProvider(providerName);
        let vm = this;
        auth.signInWithPopup(provider).then(function(result) {
            console.log("User credentials were validated.  Now let's see if we can access their store..");
            vm.authenticationHandler(result);
        }).catch(function(error) {
            console.log("Something happened..User was unable to sign in.");
            console.debug(error);
        });
    }

    authenticationHandler(result) {
        console.log("Result from login is: ");
        console.debug(result);

        let ref = firebase.database().ref();

        let store = this.props.params.storeId;
        let userId = result.user.uid;

        const storeRef = ref.child(store);

        // var token = firebase.auth().createCustomToken(userId);
        // localStorage.setItem('token', userId);

        storeRef.on('value', (snapshot)=> {
            let data = snapshot.val() || {};
            // claim it as our own if there is no owner already
            if(!data.owner) {
                console.log("About to set owner?");
                storeRef.set({
                    owner : userId
                });
            }
            // update our state to reflect the current store owner and User
            this.setState({
                uid : userId,
                owner : data.owner || userId
            });
        });
    }

    // componentWillMount() {
    //     console.log("Checking to see if we can log them in");
    //     let auth = firebase.auth();
    //     let token = localStorage.getItem('token');
    //     if(token) {
    //         auth.signInWithCustomToken(token).catch(function(error) {
    //             console.log("An error has occured with the local storage token.");
    //             console.log(error);
    //         });
    //         ref.authWithCustomToken(token, this.authenticationHandler);
    //     }
    // }

    renderInventory(key) {
        var linkState = this.props.linkState;
        return (
            <div className="fish-edit" key={key}>
                <input type="text" valueLink={linkState('fishes.' + key + '.name')}/>
                <input type="text" valueLink={linkState('fishes.' + key + '.price')}/>
                <select valueLink={linkState('fishes.' + key + '.status')}>
                    <option value="unavailable">Sold out!</option>
                    <option value="available">Fresh!</option>
                </select>
                <textarea valueLink={linkState('fishes.' + key + '.desc')}></textarea>
                <input type="text" valueLink={linkState('fishes.' + key + '.image')}/>
                <button onClick={this.props.removeFish.bind(null, key)}>Remove Fish</button>
            </div>
        )
    }

    renderLogin() {
        return (
          <nav className="login">
            <h2>Inventory</h2>
            <p>Sign in to manage your store's inventory</p>
            <button
                className="github"
                onClick={this.authenticate.bind(this, 'github')}>Log In with Github</button>

            <button className="facebook"
                onClick={this.authenticate.bind(this, 'facebook')}>Log In with Facebook</button>

            <button className="twitter"
                onClick={this.authenticate.bind(this, 'twitter')}>Log In with Twitter</button>
          </nav>
        )
    }

    render() {
        let logoutButton = <button onClick={this.logout}>Log Out!</button>
        // first check if they arent logged in
        if(!this.state.uid) {
            return (
                <div>{this.renderLogin()}</div>
            )
        }
        // then check if they ARENT the owner of the current store
        if(this.state.uid !== this.state.owner) {
            return (
                <div>
                    <p>Sorry, you aren't the owner of this store, young feller.</p>
                    {logoutButton}
                </div>
            )
        }
        return (
            <div>
                <h2>Inventory</h2>
                {logoutButton}
                {Object.keys(this.props.fishes).map(this.renderInventory)}

                <AddFishForm {...this.props} />
                <button onClick={this.props.loadSamples}>Load Sample Fishes</button>
            </div>
        )
    }
}

Inventory.propTypes = {
    addFish : React.PropTypes.func.isRequired,
    loadSamples : React.PropTypes.func.isRequired,
    fishes : React.PropTypes.object.isRequired,
    linkState : React.PropTypes.func.isRequired,
    removeFish : React.PropTypes.func.isRequired
}

export default Inventory;
