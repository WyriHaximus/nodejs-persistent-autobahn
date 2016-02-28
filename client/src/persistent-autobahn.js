import autobahn from 'autobahn';
import Deque from 'collections/deque';
import when from 'when';

let setUpConnection = (configOrConnection) => {
    if (configOrConnection.url) {
        return new autobahn.Connection(configOrConnection);
    }

    return configOrConnection;
};

export class PersistentAutobahn  {
    constructor(configOrConnection)  {
        this.queuedCalls   = new Deque();
        this.subscriptions = new Deque();
        this.open          = false;
        this.connected     = false;
        this.connection    = setUpConnection(configOrConnection);

        this.connection.onopen = function(session) {
            this.connected = true;
            this.session = session;

            this.queuedCalls.forEach(function(deferred) {
                deferred.resolve();
            });
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
        if (this.open == true) {
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

    subscribe(target, callback, options = []) {
        this.connect();

        //

        if (this.connected) {
            return this.session.subscribe(target, callback, options);
        }

    }
}