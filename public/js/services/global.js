angular.module('mean.system')
  .factory('Global', [function() {
    var _this = this;
    _this._data = {
        user: window.user,
        authenticated: !! window.user
    };

    return _this._data;
}]).factory('QuestionService', ['$http', '$q', function($http, $q) {
  return {
    getQuestions: function() {
      return $q.all([
        $http.get('/questions')
      ])
      .then(function(results) {
        var data = {};
        data = results[0].data;
        return data;
      });
    }
  };
}]).factory('AnswerService', ['$http', '$q', function($http, $q) {
  return {
    getAnswers: function() {
      return $q.all([
        $http.get('/answers')
      ])
      .then(function(results) {
        var data = {};
        data = results[0].data;
        return data;
      });
    }
  };
}]);