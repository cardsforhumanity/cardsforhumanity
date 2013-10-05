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
  questions.allQuestionsForGame(function(data){
    this.questions = data;
  });
};

Game.prototype.getAnswers = function() {
  answers.allAnswersForGame(function(data){
    this.answers = data;
  });
};

module.exports = Game;