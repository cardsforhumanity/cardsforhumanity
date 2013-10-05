var async = require('async');
var questions = require(__dirname + '/../../app/controllers/questions.js');
var answers = require(__dirname + '/../../app/controllers/answers.js');

function Game(gameID) {
  this.gameID = gameID;
  this.players = [];
  this.playerLimit = 3;
  this.state = "awaiting players";
  this.questions = null;
  this.answers = null;
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
    });
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

