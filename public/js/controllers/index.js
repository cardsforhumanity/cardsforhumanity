angular.module('mean.system').controller('IndexController', ['$scope', 'Global', 'socket', function ($scope, Global, socket) {
    $scope.global = Global;
    socket.on('test', function() {
      console.log('test!');
    });
}]).controller('CardController', ['$scope', 'QuestionService', 'AnswerService', function($scope, QuestionService, AnswerService) {
  $scope.question = {};
  QuestionService.getQuestions()
    .then(function(data) {
      $scope.question = data;
    });

  $scope.answers = [];
  AnswerService.getAnswers()
    .then(function(data) {
      $scope.answers = data;
    });
}]);