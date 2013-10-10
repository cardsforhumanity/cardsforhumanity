var async = require('async');
var _ = require('underscore');
var questions = require(__dirname + '/../../app/controllers/questions.js');
var answers = require(__dirname + '/../../app/controllers/answers.js');

function Game(gameID, io) {
  this.io = io;
  this.gameID = gameID;
  this.players = []; // Contains array of player models
  this.table = []; // Contains array of {card: card, player: player.id}
  this.winningCard = -1; // Index in this.table
  this.winner = -1; // Index in this.players
  this.winnerAutopicked = false;
  this.czar = -1; // Index in this.players
  this.playerMinLimit = 3;
  this.playerMaxLimit = 6;
  this.pointLimit = 5;
  this.state = "awaiting players";
  this.round = 0;
  this.questions = null;
  this.answers = null;
  this.curQuestion = null;
  this.timeLimits = {
    stateChoosing: 15000,
    stateJudging: 10000,
    stateResults: 5000
  };
  // setTimeout ID that triggers the czar judging state
  // Used to automatically run czar judging if players don't pick before time limit
  // Gets cleared if players finish picking before time limit.
  this.choosingTimeout = 0;
  // setTimeout ID that triggers the result state
  // Used to automatically run result if czar doesn't decide before time limit
  // Gets cleared if czar finishes judging before time limit.
  this.judgingTimeout = 0;
  this.resultsTimeout = 0;
}

Game.prototype.payload = function() {
  var players = [];
  this.players.forEach(function(player,index) {
    players.push({
      hand: player.hand,
      points: player.points,
      username: player.username,
      avatarURL: player.avatarURL,
      //userID: player.userID, // Do we really need to send this?
      socketID: player.socket.id,
      color: player.color
    });
  });
  return {
    players: players,
    czar: this.czar,
    state: this.state,
    round: this.round,
    winningCard: this.winningCard,
    winnerAutopicked: this.winnerAutopicked,
    table: this.table,
    curQuestion: this.curQuestion
  };
};

Game.prototype.sendNotification = function(msg) {
  this.io.sockets.in(this.gameID).emit('notification', {notification: msg});
};

// Currently called on each joinGame event from socket.js
// Also called on removePlayer IF game is in 'awaiting players' state
Game.prototype.assignPlayerColors = function() {
  this.players.forEach(function(player,index) {
    player.color = index;
  });
};

Game.prototype.prepareGame = function() {
  this.state = "game in progress";

  this.io.sockets.in(this.gameID).emit('prepareGame',
    {
      playerMinLimit: this.playerMinLimit,
      playerMaxLimit: this.playerMaxLimit,
      pointLimit: this.pointLimit,
      timeLimits: this.timeLimits
    });

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

      self.startGame();
    });
};

Game.prototype.startGame = function() {
  console.log(this.state);
  this.shuffleCards(this.questions);
  this.shuffleCards(this.answers);
  this.stateChoosing(this);
};

Game.prototype.sendUpdate = function() {
  this.io.sockets.in(this.gameID).emit('gameUpdate', this.payload());
};

Game.prototype.stateChoosing = function(self) {
  self.state = "waiting for players to pick";
  console.log(self.state);
  self.table = [];
  self.winningCard = -1;
  self.winnerAutopicked = false;
  self.curQuestion = self.questions.pop();
  self.round++;
  self.dealAnswers();
  // Rotate card czar
  if (self.czar >= self.players.length - 1) {
    self.czar = 0;
  } else {
    self.czar++;
  }
  self.sendUpdate();

  self.choosingTimeout = setTimeout(function() {
    self.stateJudging(self);
  }, self.timeLimits.stateChoosing);
};

Game.prototype.selectFirst = function() {
  if (this.table.length) {
    this.winningCard = 0;
    var winnerIndex = this._findPlayerIndexBySocket(this.table[0].player);
    this.players[winnerIndex].points++;
    this.winnerAutopicked = true;
    this.stateResults(this);
  } else {
    console.log('no cards were picked!');
    this.stateChoosing(this);
  }
};

Game.prototype.stateJudging = function(self) {
  self.state = "waiting for czar to decide";
  console.log(self.state);

  if (self.table.length <= 1) {
    // Automatically select a card if only one card was submitted
    self.selectFirst();
  } else {
    self.sendUpdate();
    self.judgingTimeout = setTimeout(function() {
      // Automatically select the first submitted card when time runs out.
      self.selectFirst();
    }, self.timeLimits.stateJudging);
  }
};

Game.prototype.stateResults = function(self) {
  self.state = "winner has been chosen";
  console.log(self.state);
  // TODO: do stuff
  var endGame = false;
  for (var i = 0; i < self.players.length; i++) {
    if (self.players[i].points >= self.pointLimit) {
      endGame = true;
    }
  }
  var curQuestionArr = self.curQuestion.text.split('_');
  if (curQuestionArr.length > 1) {
    // Handling just one answer for now. It should be an array of answers later.
    console.log('self.table',self.table);
    console.log('self.winningCard',self.winningCard);
    console.log('winning card text',self.table[self.winningCard].card[0].text);
    curQuestionArr.splice(1,0,self.table[self.winningCard].card[0].text);
    if (self.curQuestion.numAnswers === 2) {
      curQuestionArr.splice(3,0,self.table[self.winningCard].card[1].text);
    }
    self.curQuestion.text = curQuestionArr.join("");
  } else {
    self.curQuestion.text += ' '+self.table[self.winningCard].card[0].text;
  }

  self.sendUpdate();
  self.resultsTimeout = setTimeout(function() {
    if (endGame) {
      self.stateEndGame(i);
    } else {
      self.stateChoosing(self);
    }
  }, self.timeLimits.stateResults);
};

Game.prototype.stateEndGame = function(winner) {
  this.state = "game ended";
  this.winner = winner;
  this.sendUpdate();
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

Game.prototype._findPlayerIndexBySocket = function(thisPlayer) {
  var playerIndex = -1;
  _.each(this.players, function(player, index) {
    if (player.socket.id === thisPlayer) {
      playerIndex = index;
    }
  });
  return playerIndex;
};

Game.prototype.pickCards = function(thisCardArray, thisPlayer) {
  // Only accept cards when we expect players to pick a card
  if (this.state === "waiting for players to pick") {
    // Find the player's position in the players array
    var playerIndex = this._findPlayerIndexBySocket(thisPlayer);
    console.log('player is at index',playerIndex);
    if (playerIndex !== -1) {
      // Verify that the player hasn't previously picked a card
      var previouslySubmitted = false;
      _.each(this.table, function(pickedSet, index) {
        if (pickedSet.player === thisPlayer) {
          previouslySubmitted = true;
        }
      });
      if (!previouslySubmitted) {
        // Find the indices of the cards in the player's hand (given the card ids)
        var tableCard = [];
        for (var i = 0; i < thisCardArray.length; i++ ) {
          var cardIndex = null;
          for (var j = 0; j < this.players[playerIndex].hand.length; j++) {
            if (this.players[playerIndex].hand[j].id === thisCardArray[i]) {
              cardIndex = j;
            }
          }
          console.log('card',i,'is at index',cardIndex);
          if (cardIndex !== null) {
            tableCard.push(this.players[playerIndex].hand.splice(cardIndex,1)[0]);
          }
          console.log('table object at',cardIndex,':',tableCard);
        }
        if (tableCard.length === this.curQuestion.numAnswers) {
          this.table.push({
            card: tableCard,
            player: this.players[playerIndex].socket.id
          });
        }
        console.log('final table object',this.table);
        if (this.table.length === this.players.length-1) {
          clearTimeout(this.choosingTimeout);
          this.stateJudging(this);
        } else {
          this.sendUpdate();
        }
      }
    }
  } else {
    console.log('NOTE:',thisPlayer,'picked a card during',this.state);
  }
};

Game.prototype.removePlayer = function(thisPlayer) {
  var playerIndex = this._findPlayerIndexBySocket(thisPlayer);

  // Remove player from this.players
  this.players.splice(playerIndex,1);

  if (this.state === "awaiting players") {
    this.assignPlayerColors();
  }

  // Check if the player is the czar
  if (this.czar === playerIndex) {
    // If the player is the czar...
    // If players are currently picking a card, advance to a new round.
    if (this.state === "waiting for players to pick") {
      clearTimeout(this.choosingTimeout);
      return this.stateChoosing();
    } else if (this.state === "waiting for czar to decide") {
      // If players are waiting on a czar to pick, auto pick.
      this.pickWinning(this.table[0].card[0].id, thisPlayer, true);
    }
  }

  this.sendUpdate();
  this.sendNotification(thisPlayer+' has left the game.');
};

Game.prototype.pickWinning = function(thisCard, thisPlayer, autopicked) {
  console.log(thisCard);
  autopicked = autopicked || false;
  var playerIndex = this._findPlayerIndexBySocket(thisPlayer);
  if ((playerIndex === this.czar || autopicked) && this.state === "waiting for czar to decide") {
    var cardIndex = -1;
    _.each(this.table, function(winningSet, index) {
      if (winningSet.card[0].id === thisCard) {
        cardIndex = index;
      }
    });
    console.log('winning card is at index',cardIndex);
    if (cardIndex !== -1) {
      this.winningCard = cardIndex;
      var winnerIndex = this._findPlayerIndexBySocket(this.table[cardIndex].player);
      this.players[winnerIndex].points++;
      clearTimeout(this.judgingTimeout);
      this.winnerAutopicked = autopicked;
      this.stateResults(this);
    } else {
      console.log('WARNING: czar',thisPlayer,'picked a card that was not on the table.');
    }
  } else {
    // TODO: Do something?
    this.sendUpdate();
  }
};

Game.prototype.killGame = function() {
  console.log('killing game');
  clearTimeout(this.resultsTimeout);
  clearTimeout(this.choosingTimeout);
  clearTimeout(this.judgingTimeout);
};

module.exports = Game;

