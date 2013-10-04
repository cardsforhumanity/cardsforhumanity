function Game(gameID) {
  this.gameID = gameID;
  this.players = [];
  this.playerLimit = 3;
  this.state = "awaiting players";
};

Game.prototype.startGame = function() {
  this.state = "game in progress";
};

module.exports = Game;