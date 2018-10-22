angular.module('mean.system')
.factory('socket', ['$rootScope', function($rootScope){
  var socket = io.connect();
  return {
    on: function(eventName, callback){
      socket.on(eventName, function(){
        var args = arguments;
        $rootScope.safeApply(function(){
          callback.apply(socket, args);
        });
      });
    },
    emit: function(eventName, data, callback){
      socket.emit(eventName, data, function(){
        var args = arguments;
      });
      $rootScope.safeApply(function(){
        if(callback){
          callback.apply(socket, args);
        }
      });
    },
    removeAllListeners: function(eventName, callback){
      socket.removeAllListeners(eventName, function () {
        var args = arguments;
        $rootScope.safeApply(function() {
          if(callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  };
}]);