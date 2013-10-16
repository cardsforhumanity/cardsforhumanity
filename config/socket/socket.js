var Game = require('./game');
var Player = require('./player');
var mongoose = require('mongoose');
var User = mongoose.model('User');

var avatars = require(__dirname + '/../../app/controllers/avatars.js').all();
// Valid characters to use to generate random private game IDs
var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";

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
      joinGame(socket,data);
    });

    socket.on('startGame', function() {
      if (allGames[socket.gameID]) {
        var thisGame = allGames[socket.gameID];
        console.log('comparing',thisGame.players[0].socket.id,'with',socket.id);
        if (thisGame.players.length >= thisGame.playerMinLimit) {
          thisGame.prepareGame();
          thisGame.sendNotification('The game has begun!');
        }
      }
    });

    socket.on('joinNewGame', function(data) {
      exitGame(socket);
      joinGame(socket,data);
    });

    socket.on('createGameWithFriends', function() {
      createGameWithFriends(socket);
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

  var joinGame = function(socket,data) {
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
        getGame(player,socket,data.room);
      });
    } else {
      // If the user isn't authenticated (guest)
      player.username = 'Guest';
      player.avatar = avatars[Math.floor(Math.random()*4)+12];
      getGame(player,socket,data.room);
    }
  };

  var getGame = function(player,socket,requestedGameId) {
    console.log(socket.id,'is requesting room',requestedGameId);
    if (requestedGameId.length && allGames[requestedGameId]) {
      console.log('Room',requestedGameId,'is valid');
      var game = allGames[requestedGameId];
      if (game.state === 'awaiting players' && game.players[0].socket.id !== socket.id) {
        // Put player into the requested game
        console.log('Allowing player to join',requestedGameId);
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
      } else {
        // TODO: Send an error message back to this user saying the game has already started
      }
    } else {
      // Put players into the general queue
      console.log('Redirecting player',socket.id,'to general queue');
      fireGame(player,socket);
    }

  };

  var fireGame = function(player,socket) {
    var game;
    if (gamesNeedingPlayers.length <= 0) {
      gameID += 1;
      var gameIDStr = gameID.toString();
      game = new Game(gameIDStr, io);
      game.players.push(player);
      allGames[gameID] = game;
      gamesNeedingPlayers.push(game);
      socket.join(game.gameID);
      socket.gameID = game.gameID;
      console.log('Create new Game',game.gameID);
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

  var createGameWithFriends = function(socket) {
    var isUniqueRoom = false;
    var uniqueRoom = '';

    if (allGames[socket.gameID]) {
      // Get player object before we take this player out of the existing game.
      var existingGame = allGames[socket.gameID];
      var player = existingGame.getPlayer(socket.id);

      if (Object.keys(player).length !== 0) {
        exitGame(socket);
        // Generate a random 6-character game ID
        while (!isUniqueRoom) {
          uniqueRoom = '';
          for (var i = 0; i < 6; i++) {
            uniqueRoom += chars[Math.floor(Math.random()*chars.length)];
          }
          if (!allGames[uniqueRoom]) {
            isUniqueRoom = true;
          }
        }
        console.log('Created unique game',uniqueRoom);
        var game = new Game(uniqueRoom,io);
        game.players.push(player);
        allGames[uniqueRoom] = game;
        socket.join(game.gameID);
        socket.gameID = game.gameID;
        game.assignPlayerColors();
        game.sendUpdate();
      }
    }
  };

  var exitGame = function(socket) {
    if (allGames[socket.gameID]) { // Make sure game exists
      var game = allGames[socket.gameID];
      if (game.state === 'awaiting players' ||
        game.players.length-1 >= game.playerMinLimit) {
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
