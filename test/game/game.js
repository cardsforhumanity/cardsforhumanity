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

  // it('Should broadcast new user to all users', function(done){
  // var client1 = io.connect(socketURL, options);

  // client1.on('connect', function(data){
  //   client1.emit('connection name', chatUser1);

  //   /* Since first client is connected, we connect
  //   the second client. */
  //   var client2 = io.connect(socketURL, options);

  //   client2.on('connect', function(data){
  //     client2.emit('connection name', chatUser2);
  //   });

  //   client2.on('new user', function(usersName){
  //     usersName.should.equal(chatUser2.name + " has joined.");
  //     client2.disconnect();
  //   });

  // });

  // var numUsers = 0;
  // client1.on('new user', function(usersName){
  //   numUsers += 1;

  //   if(numUsers === 2){
  //     usersName.should.equal(chatUser2.name + " has joined.");
  //     client1.disconnect();
  //     done();
  //   }
  // });
});
