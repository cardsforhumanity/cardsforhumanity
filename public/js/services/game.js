angular.module('mean.system')
  .factory('game', ['socket', function(socket){

  var game = {
    id: null,
    players: [],
    playerIndex: 0,
    winningCard: -1,
    winner: -1,
    table: [],
    czar: null,
    playerMinLimit: null,
    playerMaxLimit: null,
    pointLimit: null,
    state: null,
    curQuestion: null,
    timeLimits: {}
  };

  socket.on('id', function(data) {
    game.id = data.id;
  });

  socket.on('prepareGame', function(data) {
    game.playerMinLimit = data.playerMinLimit;
    game.playerMaxLimit = data.playerMaxLimit;
    game.pointLimit = data.pointLimit;
    game.timeLimits = data.timeLimits;
  });

  socket.on('gameUpdate', function(data) {
    // console.log(data);

    if (data.state !== game.state) {
      game.state = data.state;
    }
    game.players = data.players;
    game.table = data.table;
    game.winningCard = data.winningCard;
    game.winnerAutopicked = data.winnerAutopicked;
    game.winner = data.winner;

    if (data.state === 'waiting for players to pick') {
      game.czar = data.czar;
      game.curQuestion = data.curQuestion;
    }

    for (var i = 0; i < data.players.length; i++) {
      if (game.id === data.players[i].socketID) {
        game.playerIndex = i;
      }
    }
  });

  socket.on('dissolveGame', function(){
    console.log('Game Dissolved');
  });

  game.joinGame = function(){
    socket.emit('joinGame');
  };

  game.leaveGame = function(){
    socket.emit('leaveGame');
  };

  game.pickCard = function(card){
    socket.emit('pickCard',{card: card.id});
  };

  game.pickWinning = function(card) {
    socket.emit('pickWinning',{card: card.id});
  };

  return game;
}]);