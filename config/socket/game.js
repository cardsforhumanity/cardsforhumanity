var async = require('async');
var _ = require('underscore');
var questions = require(__dirname + '/../../app/controllers/questions.js');
var answers = require(__dirname + '/../../app/controllers/answers.js');

function Game(gameID, io) {
  this.io = io;
  this.gameID = gameID;
  this.players = []; // Contains array of player models
  this.table = []; // Contains array of {card: card, player: player.id}
  this.winningCard = -1; // Index in this.table
  this.winner = -1; // Index in this.players
  this.winnerAutopicked = false;
  this.czar = -1; // Index in this.players
  this.playerMinLimit = 3;
  this.playerMaxLimit = 6;
  this.pointLimit = 5;
  this.state = "awaiting players";
  this.questions = null;
  this.answers = null;
  this.curQuestion = null;
  this.timeLimits = {
    stateChoosing: 15000,
    stateJudging: 10000,
    stateResults: 5000
  };
  // setTimeout ID that triggers the czar judging state
  // Used to automatically run czar judging if players don't pick before time limit
  // Gets cleared if players finish picking before time limit.
  this.choosingTimeout = 0;
  // setTimeout ID that triggers the result state
  // Used to automatically run result if czar doesn't decide before time limit
  // Gets cleared if czar finishes judging before time limit.
  this.judgingTimeout = 0;
};

Game.prototype.payload = function() {
  var players = [];
  this.players.forEach(function(player,index) {
    players.push({
      hand: player.hand,
      points: player.points,
      username: player.username,
      avatarURL: player.avatarURL,
      userID: player.userID,
      socketID: player.socket.id
    });
  });
  return {
    players: players,
    czar: this.czar,
    state: this.state,
    winningCard: this.winningCard,
    winnerAutopicked: this.winnerAutopicked,
    table: this.table,
    curQuestion: this.curQuestion
  };
};

Game.prototype.prepareGame = function() {
  this.state = "game in progress";

  this.io.sockets.in(this.gameID).emit('prepareGame',
    {
      playerMinLimit: this.playerMinLimit,
      playerMaxLimit: this.playerMaxLimit,
      pointLimit: this.pointLimit,
      timeLimits: this.timeLimits
    });

  var self = this;
  async.parallel([
    this.getQuestions,
    this.getAnswers
    ],
    function(err, results){
      if (err) {
        console.log(err);
      }
      self.questions = results[0];
      self.answers = results[1];

      self.startGame();
    });
};

Game.prototype.startGame = function() {
  console.log(this.state);
  this.shuffleCards(this.questions);
  this.shuffleCards(this.answers);
  this.stateChoosing(this);
};

Game.prototype.sendUpdate = function() {
  this.io.sockets.in(this.gameID).emit('gameUpdate', this.payload());
};

Game.prototype.stateChoosing = function(self) {
  self.state = "waiting for players to pick";
  console.log(self.state);
  self.table = [];
  self.winningCard = -1;
  self.winnerAutopicked = false;
  self.curQuestion = self.questions.pop();
  self.dealAnswers();
  // Rotate card czar
  if (self.czar >= self.players.length - 1) {
    self.czar = 0;
  } else {
    self.czar++;
  }
  self.sendUpdate();

  self.choosingTimeout = setTimeout(function() {
    self.stateJudging(self);
  }, self.timeLimits.stateChoosing);
};

Game.prototype.stateJudging = function(self) {
  self.state = "waiting for czar to decide";
  console.log(self.state);
  var selectFirst = function() {
    if (self.table.length) {
      self.winningCard = 0;
      var winnerIndex = self._findPlayerIndexBySocket(self.table[0].player);
      self.players[winnerIndex].points++;
      self.winnerAutopicked = true;
      self.stateResults(self);
    } else {
      console.log('no cards were picked!');
      self.stateChoosing(self);
    }
  };
  if (this.table.length <= 1) {
    // Automatically select a card if only one card was submitted
    selectFirst();
  } else {
    self.sendUpdate();
    self.judgingTimeout = setTimeout(function() {
      // Automatically select the first submitted card when time runs out.
      selectFirst();
    }, self.timeLimits.stateJudging);
  }
};

Game.prototype.stateResults = function(self) {
  self.state = "winner has been chosen";
  console.log(self.state);
  // TODO: do stuff
  var endGame = false;
  for (var i = 0; i < self.players.length; i++) {
    if (self.players[i].points >= self.pointLimit) {
      endGame = true;
    }
  }
  self.sendUpdate();
  setTimeout(function() {
    if (endGame) {
      self.stateEndGame(i);
    } else {
      self.stateChoosing(self);
    }
  }, self.timeLimits.stateResults);
};

Game.prototype.stateEndGame = function(winner) {
  this.state = "game ended";
  this.winner = winner;
  this.sendUpdate();
};

Game.prototype.getQuestions = function(cb) {
  questions.allQuestionsForGame(function(data){
    cb(null,data);
  });
};

Game.prototype.getAnswers = function(cb) {
  answers.allAnswersForGame(function(data){
    cb(null,data);
  });
};

Game.prototype.shuffleCards = function(cards) {
  var shuffleIndex = cards.length;
  var temp;
  var randNum;

  while(shuffleIndex) {
    randNum = Math.floor(Math.random() * shuffleIndex--);
    temp = cards[randNum];
    cards[randNum] = cards[shuffleIndex];
    cards[shuffleIndex] = temp;
  }

  return cards;
};

Game.prototype.dealAnswers = function(maxAnswers) {
  maxAnswers = maxAnswers || 10;
  for (var i = 0; i < this.players.length; i++) {
    while (this.players[i].hand.length < maxAnswers) {
      this.players[i].hand.push(this.answers.pop());
    }
  }
};

Game.prototype._findPlayerIndexBySocket = function(thisPlayer) {
  var playerIndex = -1;
  _.each(this.players, function(player, index) {
    if (player.socket.id === thisPlayer) {
      playerIndex = index;
    }
  });
  return playerIndex;
};

Game.prototype.pickCard = function(thisCard, thisPlayer) {
  // Only accept cards when we expect players to pick a card
  if (this.state === "waiting for players to pick") {
    // Find the player's position in the players array
    var playerIndex = this._findPlayerIndexBySocket(thisPlayer);
    console.log('player is at index',playerIndex);
    if (playerIndex !== -1) {
      // Verify that the player hasn't previously picked a card
      var previouslySubmitted = false;
      _.each(this.table, function(pickedSet, index) {
        if (pickedSet.player === thisPlayer) {
          previouslySubmitted = true;
        }
      });
      if (!previouslySubmitted) {
        var cardIndex = -1;
        _.each(this.players[playerIndex].hand, function(card, index) {
          if (card.id === thisCard) {
            cardIndex = index;
          }
        });
        console.log('card is at index',cardIndex);
        if (cardIndex !== -1) {
          this.table.push({
            card: this.players[playerIndex].hand.splice(cardIndex,1)[0],
            player: this.players[playerIndex].socket.id
          });
          console.log(this.table);
          if (this.table.length === this.players.length-1) {
            clearTimeout(this.choosingTimeout);
            this.stateJudging(this);
          } else {
            this.sendUpdate();
          }
        }
      }
    }
  } else {
    console.log('NOTE:',thisPlayer,'picked a card during',this.state);
  }
};

Game.prototype.removePlayer = function(thisPlayer) {
  // Check if the player is the czar
  if (this.czar === this._findPlayerIndexBySocket(thisPlayer)) {
    // If the player is the czar...
    // ...
  }
  // Remove player from this.players
  for (var i = 0; i < this.players.length; i++) {
    if (this.players[i].socket.id === thisPlayer) {
      this.players.splice(i,1);
    }
  }
  this.sendUpdate();
};

Game.prototype.pickWinning = function(thisCard, thisPlayer) {
  var playerIndex = this._findPlayerIndexBySocket(thisPlayer);
  if (playerIndex === this.czar && this.state === "waiting for czar to decide") {
    var cardIndex = -1;
    _.each(this.table, function(winningSet, index) {
      if (winningSet.card.id === thisCard) {
        cardIndex = index;
      }
    });
    console.log('winning card is at index',cardIndex);
    if (cardIndex !== -1) {
      this.winningCard = cardIndex;
    }
    var winnerIndex = this._findPlayerIndexBySocket(this.table[cardIndex].player);
    this.players[winnerIndex].points++;
    clearTimeout(this.judgingTimeout);
    this.stateResults(this);
  } else {
    // TODO: Do something?
    this.sendUpdate();
  }
};

module.exports = Game;

