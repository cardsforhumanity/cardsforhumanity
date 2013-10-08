angular.module('mean.system')
.controller('IndexController', ['$scope', 'Global', '$location', 'socket', 'game', function ($scope, Global, $location, socket, game) {
    $scope.global = Global;

    $scope.playAsGuest = function() {
      game.joinGame();
      $location.path('/app');
    };

}]);