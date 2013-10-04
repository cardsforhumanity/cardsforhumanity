angular.module('card.directives', [])
  .directive('Cards', function() {
    return {
      restrict: 'EA',
      templateUrl: '/views/bottom.html',
      link: function(scope, elem, attr) {
      }
    };
  });