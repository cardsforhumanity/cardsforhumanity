angular.module('mean.system')
  .factory('Global', [function() {
    var _this = this;
    _this._data = {
        user: window.user,
        authenticated: !! window.user
    };

    return _this._data;
}]).factory('ApiService', ['$http', '$q', function($http, $q) {
  return {
    getCards: function() {
      return $q.all([
        $http.get('/answers'),
        $http.get('/questions')
      ])
      .then(function(results) {
        var data = [];
        angular.forEach(results, function(result){
          data = data.concat(result.data);
        });
        return data;
      });
    }
  };
}]);