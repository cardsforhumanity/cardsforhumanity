var should = require('should');
var io = require('socket.io-client');

var socketURL = 'http://localhost:3000';

var options ={
  transports: ['websocket'],
  'force new connection': true
};

var cfhPlayer1 = {'name':'Tom'};
var cfhPlayer2 = {'name':'Sally'};
var cfhPlayer3 = {'name':'Dana'};

describe("Game Server",function(){

  it('Should accept requests to joinGame', function(done) {
    var client1 = io.connect(socketURL, options);

    var disconnect = function() {
      client1.disconnect();
      done();
    };

    client1.on('connect', function(data){
      client1.emit('joinGame');

      setTimeout(disconnect,200);

    });
  });

  it('Should send a game update upon receiving request to joinGame', function(done) {
    var client1 = io.connect(socketURL, options);

    var disconnect = function() {
      client1.disconnect();
      done();
    };

    client1.on('connect', function(data){
      client1.emit('joinGame');

      client1.on('gameUpdate', function(data) {
        '1'.should.equal(data.gameID);
      });

      setTimeout(disconnect,200);

    });
  });

  it('Should announce new user to all users', function(done){
    var client1 = io.connect(socketURL, options);

    var disconnect = function() {
      client1.disconnect();
      done();
    };

    client1.on('connect', function(data){
      client1.emit('joinGame');

      var client2 = io.connect(socketURL, options);

      client2.on('connect', function(data) {

        client2.emit('joinGame');

        client1.on('notification', function(data) {
          data.notification.should.match(/ has joined the game\!/);
        });

      });

      setTimeout(disconnect,200);

    });
  });
});
