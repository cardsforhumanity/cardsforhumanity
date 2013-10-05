function Player(socket) {
  this.socket = socket;
  this.hand = [];
  this.score = 0;
  this.username = null;
}

module.exports = Player;