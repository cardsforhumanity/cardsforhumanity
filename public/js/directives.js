angular.module('mean.directives', [])
  .directive('player', function (){
    return{
      restrict: 'EA',
      templateUrl: '/views/player.html',
      link: function(scope, elem, attr){
        scope.colors = ['#7CE4E8', '#F2ADFF', '#FFFFa5', '#FC575E', '#398EC4', '#8CFF95'];
      }
    };
  }).directive('answers', function() {
    return {
      restrict: 'EA',
      templateUrl: '/views/answers.html',
      link: function(scope, elem, attr) {

        scope.$watch('game.state', function() {
          if (scope.game.state === 'waiting for czar to decide') {
            scope.countdown(scope.game.timeLimits.stateJudging,scope.game.state);
          } else if (scope.game.state === 'winner has been chosen') {
              var curQuestionArr = scope.game.curQuestion.text.split('_');
              var startStyle = "<span style='color: "+scope.colors[scope.game.players[scope.game.winningCardPlayer].color]+"'>";
              var endStyle = "</span>";
              if (curQuestionArr.length > 1) {
                var cardText = scope.game.table[scope.game.winningCard].card[0].text;
                if (cardText.indexOf('.') === cardText.length-1) {
                  cardText = cardText.slice(0,cardText.length-1);
                }
                curQuestionArr.splice(1,0,startStyle+cardText+endStyle);
                if (scope.game.curQuestion.numAnswers === 2) {
                  cardText = scope.game.table[scope.game.winningCard].card[1].text;
                  if (cardText.indexOf('.') === cardText.length-1) {
                    cardText = cardText.slice(0,cardText.length-1);
                  }
                  curQuestionArr.splice(3,0,startStyle+cardText+endStyle);
                }
                scope.game.curQuestion.text = curQuestionArr.join("");
              } else {
                scope.game.curQuestion.text += ' '+startStyle+scope.game.table[scope.game.winningCard].card[0].text+endStyle;
              }
            scope.countdown(scope.game.timeLimits.stateResults,scope.game.state);
          }
        });
      }
    };
  }).directive('question', function() {
    return {
      restrict: 'EA',
      templateUrl: '/views/question.html',
      link: function(scope, elem, attr) {


      }
    };
  })
  .directive('timer', function(){
    return{
      restrict: 'EA',
      templateUrl: '/views/timer.html',
      link: function(scope, elem, attr){}
    };
  });