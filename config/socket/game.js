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
  this.getQuestions();
  this.getAnswers();
};

Game.prototype.getQuestions = function() {
  var self = this;
  questions.allQuestionsForGame(function(data){
    self.questions = data;
  });
};

Game.prototype.getAnswers = function() {
  var self = this;
  answers.allAnswersForGame(function(data){
    self.answers = data;
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

module.exports = Game;