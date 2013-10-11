angular.module('mean.system')
  .factory('game', ['socket', '$timeout', function (socket, $timeout) {

  var game = {
    id: null,
    players: [],
    playerIndex: 0,
    winningCard: -1,
    winningCardPlayer: -1,
    gameWinner: -1,
    table: [],
    czar: null,
    playerMinLimit: 3,
    playerMaxLimit: 6,
    pointLimit: null,
    state: null,
    round: 0,
    curQuestion: null,
    notification: null,
    timeLimits: {}
  };

  var notificationQueue = [];
  var timeout = false;
  var self = this;

  var addToNotificationQueue = function(msg) {
    notificationQueue.push(msg);
    if (!timeout) { // Start a cycle if there isn't one
      setNotification();
    }
  };
  var setNotification = function() {
    if (notificationQueue.length === 0) { // If notificationQueue is empty, stop
      clearInterval(timeout);
      timeout = false;
      game.notification = '';
    } else {
      game.notification = notificationQueue.shift(); // Show a notification and check again in a bit
      timeout = $timeout(setNotification, 1300);
    }
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
    var newState;
    if (data.state !== game.state) {
      newState = true;
    } else {
      newState = false;
    }

    if (game.state !== 'waiting for players to pick') {
      game.players = data.players;
    }
    if (data.state !== game.state || game.curQuestion !== data.curQuestion) {
      game.state = data.state;
    }
    game.table = data.table;
    game.round = data.round;
    game.winningCard = data.winningCard;
    game.winningCardPlayer = data.winningCardPlayer;
    game.winnerAutopicked = data.winnerAutopicked;
    game.gameWinner = data.gameWinner;
    game.pointLimit = data.pointLimit;

    if (data.state === 'waiting for players to pick') {
      game.czar = data.czar;
      game.curQuestion = data.curQuestion;

      if (game.czar === game.playerIndex) {
        addToNotificationQueue('You\'re the Card Czar! Players are choosing answers...');
      } else if (game.curQuestion.numAnswers === 1) {
        addToNotificationQueue('Select an answer!');
      } else {
        addToNotificationQueue('Select TWO answers!');
      }
    } else if (data.state === 'winner has been chosen') {
      game.curQuestion = data.curQuestion;
    } else if (data.state === 'game dissolved' || data.state === 'game ended') {
      console.log('game dissolved or ended');
      game.players[game.playerIndex].hand = [];
    }

    for (var i = 0; i < data.players.length; i++) {
      if (game.id === data.players[i].socketID) {
        game.playerIndex = i;
      }
    }
  });

  socket.on('notification', function(data) {
    addToNotificationQueue(data.notification);
  });

  game.joinGame = function(mode) {
    mode = mode || 'joinGame';
    var userID = !!window.user ? user._id : 'unauthenticated';
    socket.emit(mode,{userID: userID});
  };

  game.startGame = function() {
    socket.emit('startGame');
  };

  game.leaveGame = function() {
    socket.emit('leaveGame');
  };

  game.pickCards = function(cards) {
    socket.emit('pickCards',{cards: cards});
  };

  game.pickWinning = function(card) {
    socket.emit('pickWinning',{card: card.id});
  };

  return game;
}]);