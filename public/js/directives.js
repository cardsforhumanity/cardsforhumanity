angular.module('mean.directives', [])
  .directive('player', function(){
    return{
      restrict: 'EA',
      templateUrl: '/views/player.html',
      link: function(scope, elem, attr){
        
      }
    };
  });