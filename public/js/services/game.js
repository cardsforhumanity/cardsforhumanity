angular.module('mean.system')
  .factory('game', ['socket', '$timeout', function(socket, $timeout){

  var game = {
    id: null,
    players: [],
    playerIndex: 0,
    winningCard: -1,
    table: [],
    czar: null,
    playerLimit: null,
    pointLimit: null,
    state: null,
    curQuestion: null,
    timeLimits: {}
  };

  var countdown = function(){
    var count = 30;
    var counter = $timeout(timer, 1000);
    function timer(){
      count -= 1;
      if(count <= 0){
        clearInterval(counter);
        return;
      }
      document.getElementById('time').innerHTML = count;
      counter = $timeout(timer, 1000);
    }
  };

  socket.on('id', function(data) {
    game.id = data.id;
  });

  socket.on('prepareGame', function(data) {
    game.playerLimit = data.playerLimit;
    game.pointLimit = data.pointLimit;
    game.timeLimits = data.timeLimits;
    countdown();
  });

  socket.on('gameUpdate', function(data) {
    // console.log(data);

    game.state = data.state;
    game.players = data.players;
    game.table = data.table;
    game.winningCard = data.winningCard;

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