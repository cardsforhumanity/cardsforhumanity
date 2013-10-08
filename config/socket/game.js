var async = require('async');
var _ = require('underscore');
var questions = require(__dirname + '/../../app/controllers/questions.js');
var answers = require(__dirname + '/../../app/controllers/answers.js');

function Game(gameID, io) {
  this.io = io;
  this.gameID = gameID;
  this.players = [];
  this.table = [];
  this.czar = -1;
  this.playerLimit = 3;
  this.pointLimit = 5;
  this.state = "awaiting players";
  this.questions = null;
  this.answers = null;
  this.curQuestion = null;
  this.timeLimits = {
    stateChoosing: 5000,
    stateJudging: 5000,
    stateResults: 5000
  };
  this.judgingTimeout;
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
    table: this.table,
    curQuestion: this.curQuestion
  };
};

Game.prototype.prepareGame = function() {
  this.state = "game in progress";

  this.io.sockets.in(this.gameID).emit('prepareGame',
    {
      playerLimit: this.playerLimit,
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

Game.prototype.stateChoosing = function(self) {
  self.state = "waiting for players to pick";
  console.log(self.state);
  self.table = [];
  self.curQuestion = self.questions.pop();
  self.dealAnswers();
  // Rotate card czar
  if (self.czar >= self.players.length - 1) {
    self.czar = 0;
  } else {
    self.czar++;
  }
  self.io.sockets.in(self.gameID).emit('gameUpdate', self.payload());


  setTimeout(function() {
    self.stateJudging(self);
  }, self.timeLimits.stateChoosing);
};

Game.prototype.stateJudging = function(self) {
  self.state = "waiting for czar to decide";
  console.log(self.state);
  // TODO: do stuff
  self.io.sockets.in(self.gameID).emit('gameUpdate', self.payload());
  self.judgingTimeout = setTimeout(function() {
    self.stateResults(self);
  }, self.timeLimits.stateJudging);
};

Game.prototype.stateResults = function(self) {
  self.state = "winner has been chosen";
  console.log(self.state);
  // TODO: do stuff
  // TODO: increment winner's score here
  for (var i = 0; i < self.players.length; i++) {
    if (self.players[i].points >= self.pointLimit) {
      // TODO: endGame()
      //return self.endGame(self.players[i]);
    }
  }
  self.io.sockets.in(self.gameID).emit('gameUpdate', self.payload());
  setTimeout(function() {
    self.stateChoosing(self);
  }, self.timeLimits.stateResults);
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

Game.prototype.pickCard = function(thisCard, thisPlayer) {
  // Find the player's position in the players array
  var playerIndex = -1;
  _.each(this.players, function(player, index) {
    if (player.socket.id === thisPlayer) {
      playerIndex = index;
    }
  });
  console.log('player is at index',playerIndex);
  var cardIndex = -1;
  _.each(this.players[playerIndex].hand, function(card, index) {
    if (card.id === thisCard) {
      cardIndex = index;
    }
  });
  console.log('card is at index',cardIndex);

  this.table.push({
    card: this.players[playerIndex].hand.splice(cardIndex,1), 
    player: this.players[playerIndex].socket.id});
  console.log(this.table);
};

module.exports = Game;

