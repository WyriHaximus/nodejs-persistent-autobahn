import autobahn from 'autobahn';
import Deque from 'collections/deque';
import List from 'collections/list';
import Map from 'collections/map';
import when from 'when';
import Random from 'random-js';

let setUpConnection = (configOrConnection) => {
    if (configOrConnection.url) {
        return new autobahn.Connection(configOrConnection);
    }

    return configOrConnection;
};

export class PersistentAutobahn  {
    constructor(configOrConnection)  {
        this.queuedCalls     = new Deque();
        this.subscriptions   = new List();
        this.subscriptionMap = new Map();
        this.open            = false;
        this.connected       = false;
        this.connection      = setUpConnection(configOrConnection);

        this.connection.onopen = function(session) {
            this.connected = true;
            this.session = session;

            this.queuedCalls.forEach(function(deferred) {
                deferred.resolve();
            });

            this.subscriptionMap.forEach(function(subscription, subId) {
                this.client.subscribe(
                    subscription.topic,
                    subscription.handler,
                    subscription.options,
                    subId
                );
            }.bind({
                client: this,
            }));
        }.bind(this);

        this.connection.onclose = function() {
            this.connected = false;
        }.bind(this);
    }

    isOpen() {
        return this.open;
    }

    isConnected() {
        return this.connected;
    }

    connect() {
        if (this.open === true) {
            return;
        }
        this.connection.open();
        this.open = true;
    }

    rpc(target, args = []) {
        this.connect();

        if (this.connected) {
            return this.session.call(target, args);
        }

        let deferred = when.defer();

        this.queuedCalls.push(deferred);

        return deferred.promise.then(function() {
            return this.client.rpc(this.target, this.args);
        }.bind({
            client: this,
            target: target,
            args:   args,
        }));
    }

    subscribe(target, callback, options = [], subId = '') {
        this.connect();

        if (subId === '') {
            subId = Random.hex()(Random.engines.nativeMath, 64);
        }

        if (this.connected) {
            return this.session.subscribe(target, callback, options).then(function(subscription) {
                this.client.subscriptionMap.set(this.subId, subscription);
                return this.subId;
            }.bind({
                client: this,
                subId:  subId,
            }));
        }

        let deferred = when.defer();

        this.queuedCalls.push(deferred);

        return deferred.promise.then(function() {
            return this.client.subscribe(this.target, this.callback, this.options);
        }.bind({
            client:   this,
            target:   target,
            callback: callback,
            options:  options,
        }));
    }
}

export default PersistentAutobahn;
