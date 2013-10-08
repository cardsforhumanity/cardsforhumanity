angular.module('mean.system')
.controller('GameController', ['$scope', 'game', function ($scope, game) {
    $scope.pickedCard = false;
    $scope.winningCardPicked = false;

    $scope.game = game;

    $scope.pickCard = function(card) {
      game.pickCard(card);
      $scope.pickedCard = true;
    };

    $scope.pickWinning = function(card) {
      if (isCzar()) {
        game.pickWinning(card);
        $scope.winningCardPicked = true;
      }
    };

    $scope.isCzar = function() {
      return game.czar === game.playerIndex;
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