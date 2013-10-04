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
      var flag = 0;
      for (var test in data) {
        rnd = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
        if (data[rnd].expansion === 'Base' && flag < 1) {
          flag++;
          $scope.question = data[rnd];
          console.log($scope.question);
        }
      }
    });

  $scope.answers = [];
  AnswerService.getAnswers()
    .then(function(data) {
      var maxVal;
      var minVal = 0;
      for (var key in data) {
        maxVal = key;
      }

      var rnd;
      var flag = 0;
      for (var test in data) {
        rnd = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
        if (data[rnd].expansion === 'Base' && flag < 10) {
          flag++;
          $scope.answers.push(data[rnd]);
          console.log($scope.answers);
        }
      }
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