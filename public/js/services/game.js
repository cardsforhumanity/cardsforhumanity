angular.module('mean.system').factory('game', ['socket', function(socket){

  socket.on('gameUpdate', function(data) {
    console.log(data);
  });

}]);