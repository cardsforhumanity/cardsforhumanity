angular.module('mean.system').controller('IndexController', ['$scope', 'Global', 'socket', function ($scope, Global, socket) {
    $scope.global = Global;
    socket.on('test', function() {
      console.log('test!');
    });
}]).controller('CardController', ['$scope', 'ApiService', function($scope, ApiService) {
  ApiService.getCards()
    .then(function(data) {
       angular.forEach(data, function(data, key){
        if (data.numAnswers) {
          answers(data);
        } else if (!data.numAnswers) {
          questions(data);
        }
      });
    });

    var answers = function(answerCards) {
      
    };

    var questions = function(questionCards) {

    };
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
**/