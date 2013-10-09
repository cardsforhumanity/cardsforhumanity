angular.module('mean.system')
.controller('GameController', ['$scope', 'game', '$timeout', function ($scope, game, $timeout) {
    $scope.pickedCard = false;
    $scope.winningCardPicked = false;
    $scope.game = game;

    $scope.pickCard = function(card) {
      game.pickCard(card);
      $scope.pickedCard = true;
    };

    $scope.isCzar = function() {
      return game.czar === game.playerIndex;
    };

    $scope.currentCzar = function($index) {
      return $index === game.czar;
    };

    $scope.pickWinning = function(winningSet) {
      if ($scope.isCzar()) {
        game.pickWinning(winningSet.card);
        $scope.winningCardPicked = true;
      }
    };

    $scope.winnerPicked = function() {
      return game.winningCard !== -1;
    };

    $scope.startGame = function() {
      game.startGame();
    };

    $scope.countdown = function(count,state){
      clearInterval(counter);
      var counter = $timeout(timer, 1000);
      function timer(){
        count -= 1;
        if(count <= 0 || game.state !== state){
          clearInterval(counter);
          return;
        }
        $scope.time = count;
        counter = $timeout(timer, 1000);
      }
    };

    $scope.$watch('game.state', function() {
      if (game.state === 'waiting for players to pick') {
        $scope.pickedCard = false;
        $scope.winningCardPicked = false;
        $scope.countdown(game.timeLimits.stateChoosing/1000,game.state);
      } else if (game.state === 'waiting for czar to decide') {
        $scope.countdown(game.timeLimits.stateJudging/1000,game.state);
      } else if (game.state === 'winner has been chosen') {
        $scope.countdown(game.timeLimits.stateResults/1000,game.state);
      }
    });

    game.joinGame();
    // Use this in the HTML: <h2></h2>
    // <div ng-repeat="card in game.hand" ng-click="pickCard(card)">{{card.id}}</div>

}]);