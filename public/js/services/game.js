angular.module('mean.system').factory('game', ['socket', function(socket){

  var game = {
    players: [],
    czar: null,
    playerLimit: null,
    pointLimit: null,
    state: null,
    curQuestion: null,
    timeLimits: {}
  };

  socket.on('gameUpdate', function(data) {
    console.log(data);
    if (data.state === 'game in progress') {
      game.playerLimit = data.playerLimit;
      game.pointLimit = data.pointLimit;
      game.timeLimits = data.timeLimits;
    }
    game.players = data.players;
    game.czar = data.czar;
    game.state = data.state;
    game.curQuestion = data.curQuestion;
  });

  return game;
}]);