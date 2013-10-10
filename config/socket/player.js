function Player(socket) {
  this.socket = socket;
  this.hand = [];
  this.points = 0;
  this.username = null;
  this.avatar = null;
  this.userID = null;
}

module.exports = Player;