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
        var question;
        var data = {};
        data = results[0].data;
        var maxVal;
        var minVal = 0;
        for (var key in data) {
          maxVal = key;
        }

        var rnd;
        var flag = 0;
        for (var test in data) {
          rnd = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
          if (data[rnd].expansion === 'Base' && flag < 1) {
            flag++;
            question = data[rnd];
          }
        }
        console.log(question);
        return question;
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
        var answers = [];
        data = results[0].data;
        var maxVal;
        var minVal = 0;
        for (var key in data) {
          maxVal = key;
        }

        var rnd;
        var flag = 0;
        for (var test in data) {
          rnd = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
          if (data[rnd].expansion === 'Base' && flag < 10) {
            flag++;
            answers.push(data[rnd]);
          }
        }
        return answers;
      });
    }
  };
}]);