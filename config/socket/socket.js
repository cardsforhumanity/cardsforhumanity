

module.exports = function(io) {

  var room;
  var roomList = {};
  var playerCount = 0;
  var roomCount = 0;

  io.sockets.on('connection', function (socket) {
    console.log(socket.id +  ' Connected');
    playerCount++;

    if(playerCount % 3 === 1){
      roomCount += 1;
      room = roomCount.toString();
      roomList[room] = {user1: socket.id};
    } else if (playerCount % 3 === 2){
      roomList[room].user2 = socket.id;
    }
    else {
      roomList[room].user3 = socket.id;
    }
    socket.join(room);
    socket['room'] = room;
    console.log('real room ', io.sockets.manager.rooms);
    console.log('roomList ', roomList);
  });
}