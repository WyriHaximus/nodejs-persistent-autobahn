var sinon = require('sinon');
var expect = require('chai').expect;
var Promise = require('when').Promise;
var persistentAutobahn = require('./index').PersistentAutobahn;
var autobahnConnection = require('autobahn').Connection;
var when = require('when');

describe('WAMPv2 autobahn persistent client', function() {
    describe('connection state changes', function() {
        it('sets onopen', function() {
            var connection = sinon.mock(autobahnConnection);
            expect(connection.onopen).to.be.undefined;
            new persistentAutobahn(connection);
            expect(connection.onopen).to.be.an.instanceof(Function);
        });

        it('sets onclose', function() {
            var connection = sinon.mock(autobahnConnection);
            expect(connection.onclose).to.be.undefined;
            new persistentAutobahn(connection);
            expect(connection.onclose).to.be.an.instanceof(Function);
        });

        it('runs onopen after connecting', function() {
            var connection = {
                open: function () {}
            };
            var clientInstance = new persistentAutobahn(connection);

            expect(clientInstance.isOpen()).to.be.false;
            expect(clientInstance.isConnected()).to.be.false;

            clientInstance.connect();

            connection.onopen();

            expect(clientInstance.isOpen()).to.be.true;
            expect(clientInstance.isConnected()).to.be.true;
        });

        it('runs onclose when disconnecting', function() {
            var connection = {
                open: function () {}
            };
            var clientInstance = new persistentAutobahn(connection);

            expect(clientInstance.isOpen()).to.be.false;
            expect(clientInstance.isConnected()).to.be.false;

            clientInstance.connect();

            connection.onopen();

            expect(clientInstance.isOpen()).to.be.true;
            expect(clientInstance.isConnected()).to.be.true;

            connection.onclose();

            expect(clientInstance.isOpen()).to.be.true;
            expect(clientInstance.isConnected()).to.be.false;
        });
    });

    describe('connect', function() {
        it('opens on connect', function() {
            var callback = sinon.spy();
            var connection = {
                open: callback
            };
            var clientInstance = new persistentAutobahn(connection);

            expect(clientInstance.isOpen()).to.be.false;
            expect(clientInstance.isConnected()).to.be.false;

            clientInstance.connect();

            expect(clientInstance.isOpen()).to.be.true;
            expect(clientInstance.isConnected()).to.be.false;
            expect(callback.called).to.be.true;
        });
    });

    describe('RPC', function() {
        it('call', function() {
            var callback = sinon.spy();
            var connection = {
                open: callback
            };
            var clientInstance = new persistentAutobahn(connection);

            var promise = clientInstance.rpc('foo', [
                'bar',
                'baz',
            ]);

            expect(promise).to.be.instanceof(Promise);
            expect(callback.called).to.be.true;
        });
    });

    describe('PUB/SUB', function() {
        it('subscribe', function(done) {
            var deferred = when.defer();
            var callbackSubscription = sinon.spy();
            var callbackSubscribe = sinon.spy(function () {
                return this.deferred.promise;
            }.bind({
                deferred: deferred,
            }));
            var connection = {
                open: function () {}
            };
            var session = {
                subscribe: callbackSubscribe
            };

            var clientInstance = new persistentAutobahn(connection);
            clientInstance.connect();
            connection.onopen(session);

            var promise = clientInstance.subscribe('foo', callbackSubscription);
            promise.done(function (subId) {
                expect(subId).to.be.string;
                done();
            });
            deferred.resolve({a: 'b'});

            expect(promise).to.be.instanceof(Promise);
            expect(callbackSubscription.called).to.be.false;
            expect(callbackSubscribe.called).to.be.true;
        });

        it('ubsubscribe', function (done) {
            var deferred = when.defer();
            var callbackSubscription = sinon.spy();
            var callbackSubscribe = sinon.spy(function () {
                return this.deferred.promise;
            }.bind({
                deferred: deferred,
            }));
            var connection = {
                open: function () {}
            };
            var session = {
                unsubscribe: callbackSubscribe
            };

            var clientInstance = new persistentAutobahn(connection);
            clientInstance.connect();
            connection.onopen(session);

            var promise = clientInstance.unsubscribe('foo', callbackSubscription);
            promise.done(function (subId) {
                expect(subId).to.be.string;
                done();
            });
            deferred.resolve({a: 'b'});

            expect(promise).to.be.instanceof(Promise);
        });
    });
});
