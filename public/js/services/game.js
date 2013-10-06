angular.module('mean.system').factory('game', ['socket', function(socket){

  var game = {
    id: null,
    players: [],
    hand: [],
    czar: null,
    playerLimit: null,
    pointLimit: null,
    state: null,
    curQuestion: null,
    timeLimits: {}
  };

  socket.on('id', function(data) {
    game.id = data.id;
  });

  socket.on('prepareGame', function(data) {
    game.playerLimit = data.playerLimit;
    game.pointLimit = data.pointLimit;
    game.timeLimits = data.timeLimits;
  });

  socket.on('gameUpdate', function(data) {
    console.log(data);

    game.state = data.state;
    game.players = data.players;

    if (data.state === 'waiting for players to pick') {
      game.czar = data.czar;
      game.curQuestion = data.curQuestion;
    }

    for (var i = 0; i < data.players.length; i++) {
      if (game.id === data.players[i].socketID) {
        game.hand = data.players[i].hand;
        console.log('game.hand set to ', game.hand);
      }
    }
  });

  return game;
}]);