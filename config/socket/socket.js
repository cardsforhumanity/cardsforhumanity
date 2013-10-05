var Game = require('./game');
var Player = require('./player');

module.exports = function(io) {

  var game;
  var allGames = {};
  var gamesNeedingPlayers = [];
  var gameID = 0;

  io.sockets.on('connection', function (socket) {
    console.log(socket.id +  ' Connected');

    socket.on('joinGame', function() {
      var player = new Player(socket);

      if (gamesNeedingPlayers.length <= 0) {
        gameID += 1;
        var gameIDStr = gameID.toString()
        game = new Game(gameIDStr, io);
        game.players.push(player);
        allGames[gameID] = game;
        gamesNeedingPlayers.push(game);
        socket.join(game.gameID);
        socket.gameID = game.gameID;
        console.log('Create new Game');
      } else {
        game = gamesNeedingPlayers[0];
        game.players.push(player);
        socket.join(game.gameID);
        socket.gameID = game.gameID;
        if (game.players.length >= game.playerLimit) {
          gamesNeedingPlayers.shift();
          game.prepareGame();
        }
      }
    });

    socket.on('leaveGame', function() {
      socket.leave(socket.gameID);
      game = allGames[socket.gameID];

      if (allGames[socket.gameID]) { // Make sure game exists
        if (game.state === 'awaiting players'){
          for (var i = 0; i < game.players.length; i++) {
            if (game.players[i].socket.id === socket.id) {
              game.players.splice(i,1);
            }
          }
        } else {
          socket.broadcast.in(game.gameID).emit('dissolveGame');
          for (var i = 0; i < game.players.length; i++) {
            game.players[i].socket.leave(socket.gameID);
          }
          delete allGames[socket.gameID];
        }
      }
    });

    socket.on('disconnect', function(){
      console.log('Rooms on Disconnect ', io.sockets.manager.rooms);
    });
  });
}