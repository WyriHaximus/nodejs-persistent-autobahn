var sinon = require('sinon');
var expect = require('chai').expect;
var Promise = require('when').Promise;
var persistentAutobahn = require('../src/persistent-autobahn').PersistentAutobahn;
var autobahnConnection = require('autobahn').Connection;

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
            var connection = {
                open: function () {}
            };
            var clientInstance = new persistentAutobahn(connection);

            var promise = clientInstance.rpc('foo', [
                'bar',
                'baz',
            ]);

            expect(promise).to.be.instanceof(Promise);

            clientInstance.connect();
        });
    });
});
