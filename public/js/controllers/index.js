angular.module('mean.system').controller('IndexController', ['$scope', 'Global', 'socket', function ($scope, Global, socket) {
    $scope.global = Global;
    socket.on('test', function() {
      console.log('test!');
    });
}]).controller('CardController', ['$scope', 'QuestionService', 'AnswerService', function($scope, QuestionService, AnswerService) {
  $scope.question = {};
  QuestionService.getQuestions()
    .then(function(data) {
      var maxVal;
      var minVal = 0;
      for (var key in data) {
        maxVal = key;
      }

      var rnd;
      for (var test in data) {
        if (minVal === 0 && maxVal && test < 10) {
          rnd = Math.floor(Math.random() * (maxVal - minVal)) + minVal;
          console.log(data[rnd]);
        }
      }
    });

  AnswerService.getAnswers()
    .then(function(data) {
      $scope.answers = data;
    });
}]);

/**
data.id -> card number
data.text -> card text
data.expansion -> if it's from the base card set or an expansion pack
--> types available -
---- Base, CAHe1, CAHe2, CAHgrognards, CAHweeaboo, CAHxmas, NEIndy,
---- NSFH, CAHe3, Image1, GOT, PAXP13
data.numAnswers --> identifies if it's a question card and how many
answers it accepts

$scope.answers[0].text --> accesses the text for the first answer card in the deck
**/