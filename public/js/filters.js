angular.module('mean.system')
  .filter('upperFirstLetter', function() {
    return function(input) {
      return input.charAt(0).toUpperCase() + input.slice(1);
    }
  });