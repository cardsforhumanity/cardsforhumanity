angular.module('mean.system')
.controller('IndexController', ['$scope', 'Global', '$location', 'socket', 'game', function ($scope, Global, $location, socket, game) {
    $scope.global = Global;

    $scope.playAsGuest = function() {
      game.joinGame();
      $location.path('/app');
    };

}]).controller('appController', ['$scope', 'QuestionService', 'AnswerService', function($scope, QuestionService, AnswerService) {
  QuestionService.getQuestions()
    .then(function(data) {
      $scope.question = data;
    });

  AnswerService.getAnswers()
    .then(function(data) {
      $scope.answers = data;
    });
}]);