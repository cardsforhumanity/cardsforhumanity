angular.module('mean.system').controller('IndexController', ['$scope', 'Global', 'socket', 'game', function ($scope, Global, socket, game) {
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

    $scope.game = game;

    $scope.pickCard = function(card){
      socket.emit('pickCard',{card: card.id});
    };
    // Use this in the HTML: <h2>{{game.curQuestion}}</h2>
    // <div ng-repeat="card in game.hand" ng-click="pickCard(card)">{{card.id}}</div>

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