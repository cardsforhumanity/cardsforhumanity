angular.module('mean.system')
.controller('GameController', ['$scope', 'game', function ($scope, game) {
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

    $scope.pickWinning = function(winningSet) {
      if ($scope.isCzar()) {
        game.pickWinning(winningSet.card);
        $scope.winningCardPicked = true;
      }
    };

    $scope.winnerPicked = function() {
      return game.winningCard !== -1;
    };

    $scope.$watch('game.state', function() {
      if (game.state === 'waiting for players to pick') {
        $scope.pickedCard = false;
        $scope.winningCardPicked = false;
      }
    });

    game.joinGame();
    // Use this in the HTML: <h2></h2>
    // <div ng-repeat="card in game.hand" ng-click="pickCard(card)">{{card.id}}</div>

}]);