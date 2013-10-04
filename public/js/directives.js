angular.module('card.directives', [])
  .directive('Cards', function() {
    return {
      restrict: 'EA',
      scope: {
        questions: '@'
      },
      templateUrl: '/views/bottom.html',
      link: function(scope, elem, attr) {
      }
    };
  });