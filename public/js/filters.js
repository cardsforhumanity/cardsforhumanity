angular.module('mean.system')
  .filter('upperFirstLetter', function() {
    return function(input) {
      input = input || '';
      return input.charAt(0).toUpperCase() + input.slice(1);
    };
  });
