var async = require('async');
var questions = require(__dirname + '/../../app/controllers/questions.js');
var answers = require(__dirname + '/../../app/controllers/answers.js');

function Game(gameID, io) {
  this.io = io;
  this.gameID = gameID;
  this.players = [];
  this.czar = -1;
  this.playerLimit = 3;
  this.pointLimit = 5;
  this.state = "awaiting players";
  this.questions = null;
  this.answers = null;
  this.curQuestion = null;
  this.timeLimits = {
    stateChoosing: 2000,
    stateJudging: 2000,
    stateResults: 2000
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
      userID: player.userID
    });
  });
  return {
    players: players,
    czar: this.czar,
    playerLimit: this.playerLimit,
    pointLimit: this.pointLimit,
    state: this.state,
    curQuestion: this.curQuestion,
    timeLimits: this.timeLimits
  };
};

Game.prototype.prepareGame = function() {
  this.state = "game in progress";
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

module.exports = Game;

