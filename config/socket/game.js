var async = require('async');
var questions = require(__dirname + '/../../app/controllers/questions.js');
var answers = require(__dirname + '/../../app/controllers/answers.js');

function Game(gameID) {
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
    stateChoosing: 30000,
    stateJudging: 10000,
    stateResults: 5000
  };
  this.judgingTimeout;
};

Game.prototype.startGame = function() {
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
      self.shuffleCards(self.questions);
      self.shuffleCards(self.answers);

      //put this into startRound
      self.curQuestion = self.questions.pop();
      self.dealAnswers();
      // rotate czar here
      self.stateChoosing();
    });
};

Game.prototype.stateChoosing = function() {
  // Rotate card czar
  if (this.czar >= this.players.length - 1) {
    this.czar = 0;
  } else {
    this.czar++;
  }
  setTimeout(this.stateJudging, this.timeLimits.stateChoosing);
};

Game.prototype.stateJudging = function() {
  //do stuff
  this.judgingTimeout = setTimeout(this.stateResults, this.timeLimits.stateJudging);
};

Game.prototype.stateResults = function() {
  //do stuff
  for (var i = 0; i < this.players.length; i++) {
    if (this.players[i].points >= this.pointLimit) {
      //return this.endGame(this.players[i]);
    }
  }
  setTimeout(this.stateChoosing, this.timeLimits.stateResults);
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

