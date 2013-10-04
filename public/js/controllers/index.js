angular.module('mean.system').controller('IndexController', ['$scope', 'Global', 'socket', function ($scope, Global, socket) {
    $scope.global = Global;
    $scope.inGame = false;

    $scope.joinGame = function(){
      socket.emit('joinGame');
      $scope.inGame = true;
    };
    $scope.leaveGame = function(){
      socket.emit('leaveGame');
      $scope.inGame = false;
    };

    socket.on('dissolveGame', function(){
      console.log('Game Dissolved');
      $scope.inGame = false;
    });
}]).controller('CardController', ['$scope', 'QuestionService', 'AnswerService', function($scope, QuestionService, AnswerService) {
  QuestionService.getQuestions()
    .then(function(data) {
      $scope.question = data;
    });

  AnswerService.getAnswers()
    .then(function(data) {
      $scope.answers = data;
    });
}]);