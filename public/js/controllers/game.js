angular.module('mean.system')
.controller('GameController', ['$scope', 'game', function ($scope, game) {
    $scope.pickedCard = false;
    
    $scope.game = game;

    $scope.pickCard = function(card) {
      game.pickCard(card);
      $scope.pickedCard = true;
    };

    $scope.$watch('game.state', function() {
      if (game.state === 'waiting for players to pick') {
        $scope.pickedCard = false;
      }
    });

    game.joinGame();
    // Use this in the HTML: <h2></h2>
    // <div ng-repeat="card in game.hand" ng-click="pickCard(card)">{{card.id}}</div>

}]);