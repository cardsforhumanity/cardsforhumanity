angular.module('mean.system')
.controller('GameController', ['$scope', 'game', function ($scope, game) {
    $scope.inGame = false;

    $scope.game = game;

    // Use this in the HTML: <h2>{{game.curQuestion}}</h2>
    // <div ng-repeat="card in game.hand" ng-click="pickCard(card)">{{card.id}}</div>

}])