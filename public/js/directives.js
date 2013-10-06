angular.module('mean.directives', [])
  .directive('player', function(){
    return{
      restrict: 'EA',
      templateUrl: '/views/player.html',
      link: function(scope, elem, attr){
      }
    };
  })
  .directive('playertwo', function(){
    return{
      restrict: 'EA',
      templateUrl: '/views/player.html',
      link: function(scope, elem, attr){
      }
    };
  })
  .directive('playerthree', function(){
    return{
      restrict: 'EA',
      templateUrl: '/views/player.html',
      link: function(scope, elem, attr){
      }
    };
  });