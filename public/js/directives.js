angular.module('mean.directives', [])
  .directive('player', ['$animator', function ($animator){
    return{
      restrict: 'EA',
      templateUrl: '/views/player.html',
      link: function(scope, elem, attr){
      }
    };
  }]).directive('answers', function() {
    return {
      restrict: 'EA',
      templateUrl: '/views/answers.html',
      link: function(scope, elem, attr) {
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