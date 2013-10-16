angular.module('mean', ['ngCookies', 'ngResource', 'ui.bootstrap', 'ui.route', 'mean.system', 'mean.directives'])
  .config(['$routeProvider',
      function($routeProvider) {
          $routeProvider.
          when('/', {
              templateUrl: 'views/index.html'
          }).
          when('/app', {
              templateUrl: '/views/app.html',
          }).
          when('/bottom', {
            templateUrl: '/views/bottom.html'
          }).
          when('/sign', {
            templateUrl: '/views/sign.html'
          }).
          otherwise({
              redirectTo: '/'
          });
      }
  ]).config(['$locationProvider',
    function($locationProvider) {
        $locationProvider.hashPrefix("!");
    }
  ]).run(['$rootScope', function($rootScope) {
  $rootScope.safeApply = function(fn) {
    var phase = this.$root.$$phase;
    if(phase == '$apply' || phase == '$digest') {
        if(fn && (typeof(fn) === 'function')) {
            fn();
        }
    } else {
        this.$apply(fn);
      }
    };
  }]);

angular.module('mean.system', []);
angular.module('mean.directives', []);