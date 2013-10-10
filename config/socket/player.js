function Player(socket) {
  this.socket = socket;
  this.hand = [];
  this.points = 0;
  this.username = null;
  this.avatarURL = null;
  this.userID = null;
  this.color = null;
}

module.exports = Player;