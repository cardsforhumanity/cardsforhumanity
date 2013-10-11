var Game = require('./game');
var Player = require('./player');
var mongoose = require('mongoose');
var User = mongoose.model('User');

var avatars = require(__dirname + '/../../app/controllers/avatars.js').all();

module.exports = function(io) {

  var game;
  var allGames = {};
  var gamesNeedingPlayers = [];
  var gameID = 0;

  io.sockets.on('connection', function (socket) {
    console.log(socket.id +  ' Connected');
    socket.emit('id', {id: socket.id});

    socket.on('pickCards', function(data) {
      console.log(socket.id,"picked",data);
      if (allGames[socket.gameID]) {
        allGames[socket.gameID].pickCards(data.cards,socket.id);
      } else {
        console.log('Received pickCard from',socket.id, 'but game does not appear to exist!');
      }
    });

    socket.on('pickWinning', function(data) {
      if (allGames[socket.gameID]) {
        allGames[socket.gameID].pickWinning(data.card,socket.id);
      } else {
        console.log('Received pickWinning from',socket.id, 'but game does not appear to exist!');
      }
    });

    socket.on('joinGame', function(data) {
      var player = new Player(socket);
      player.userID = data.userID;
      if (data.userID !== 'unauthenticated') {
        User.findOne({
          _id: data.userID
        }).exec(function(err, user) {
          if (err) {
            console.log('err',err);
            return err; // Hopefully this never happens.
          }
          if (!user) {
            // If the user's ID isn't found (rare)
            player.username = 'Guest';
            player.avatar = avatars[Math.floor(Math.random()*4)+12];
          } else {
            player.username = user.name;
            player.avatar = user.avatar || avatars[Math.floor(Math.random()*4)+12];
          }
          fireGame(player,socket);
        });
      } else {
        // If the user isn't authenticated (guest)
        player.username = 'Guest';
        player.avatar = avatars[Math.floor(Math.random()*4)+12];
        fireGame(player,socket);
      }
    });

    socket.on('startGame', function() {
      if (allGames[socket.gameID]) {
        var thisGame = allGames[socket.gameID];
        console.log('comparing',thisGame.players[0].socket.id,'with',socket.id);
        if (thisGame.players[0].socket.id === socket.id &&
         thisGame.players.length >= thisGame.playerMinLimit) {
          gamesNeedingPlayers.splice(gamesNeedingPlayers.indexOf(thisGame),1);
          thisGame.prepareGame();
          thisGame.sendNotification('The game has begun!');
        }
      }
    });

    socket.on('playAgain', function() {
      if (allGames[socket.gameID]) {
        // Before we exit the existing game, get this player's info
        game = allGames[socket.gameID];
        var player = game.players[game._findPlayerIndexBySocket(socket.id)];
        console.log(player);
        exitGame(socket);
        fireGame(player,socket);
      }
    });

    socket.on('leaveGame', function() {
      socket.leave(socket.gameID);
      exitGame(socket);
    });

    socket.on('disconnect', function(){
      console.log('Rooms on Disconnect ', io.sockets.manager.rooms);
      exitGame(socket);
    });
  });

  var fireGame = function(player,socket) {
    if (gamesNeedingPlayers.length <= 0) {
      gameID += 1;
      var gameIDStr = gameID.toString();
      game = new Game(gameIDStr, io);
      game.players.push(player);
      allGames[gameID] = game;
      gamesNeedingPlayers.push(game);
      socket.join(game.gameID);
      socket.gameID = game.gameID;
      console.log('Create new Game');
      game.assignPlayerColors();
      game.sendUpdate();
    } else {
      game = gamesNeedingPlayers[0];
      game.players.push(player);
      socket.join(game.gameID);
      socket.gameID = game.gameID;
      game.assignPlayerColors();
      game.sendUpdate();
      game.sendNotification(player.username+' has joined the game!');
      if (game.players.length >= game.playerMaxLimit) {
        gamesNeedingPlayers.shift();
        game.prepareGame();
      }
    }
  };

  var exitGame = function(socket) {
    if (allGames[socket.gameID]) { // Make sure game exists
      game = allGames[socket.gameID];
      if (game.state === 'awaiting players' ||
        game.players.length-1 >= game.playerMinLimit){
        game.removePlayer(socket.id);
      } else {
        game.stateDissolveGame();
        for (var j = 0; j < game.players.length; j++) {
          game.players[j].socket.leave(socket.gameID);
        }
        game.killGame();
        delete allGames[socket.gameID];
      }
    }
  };

};
