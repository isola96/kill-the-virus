/**
 * Socket Controller
 */

 const debug = require('debug')('game:socket_controller');

 let io = null; // socket io server instance
 
 // list of rooms and their connected users 
 const users = {};
 const playRooms = [
	 {
		 id: 'roomId',
		 name: 'roomName',
		 players: {},
	 }
 ];
 
 let ready = [];
 
 const handleDisconnect = function() {
	 debug(`Client ${this.id} disconnected`);
 
	 // find the room that this socket is part of
	 const room = playRooms.find(playroom => playroom.players.hasOwnProperty(this.id));
 
	 // if socket was not in a room, do not broadcast
	 if (!room) {
		 return;
	 }
 
	 // let everyone in the room know that this user has disconnected
	 this.broadcast.to(room.id).emit('player:disconnected', room.players[this.id]);
 
	 // remove user from list of users in that room
	 delete room.players[this.id];
 
	 // broadcast list of users in room to all connected sockets EXCEPT ourselves
	 this.broadcast.to(room.id).emit('user:list', room.players);
 };
 
 
 // Handle when a user has joined the chat
 const handlePlayerJoined = function(username, callback) {
 
	 
	 
	 debug(`User ${username} with socket id ${this.id} joins room '${playRooms[0].id}'`);
	 
	 // join room
	 this.join(playRooms[0].id);
	 
	 // b) add socket to room's `users` object
	 let obj = playRooms[0].players;
	 obj[this.id] = username;
	 
	 
	 // let everyone know that someone has connected to the chat
	 this.broadcast.to(playRooms[0].id).emit('player:connected', username);
	 
	 // confirm join
	 callback({
		 success: true,
		 roomName: playRooms[0].name,
		 players: playRooms[0].players
	 });
	 
	 // broadcast list of users in room to all connected sockets EXCEPT ourselves
	 this.broadcast.to(playRooms[0].id).emit('player:list', playRooms[0].players);
 
 };
 
 
 module.exports = function(socket, _io) {
	  io = _io;
  
	  debug('a new client has connected', socket.id);
  
	  io.emit("new-connection", "A new user has connected");
  
	  socket.emit('player:connected', socket.id);
  
	  // handle user disconnect
	  socket.on('disconnect', handleDisconnect);
  
	  // handle player joined
	  socket.on('player:joined', handlePlayerJoined);
	  
	  socket.on('player:ready', ()=> {
		 ready.push(socket.id);
		 console.log(ready);
		 console.log(ready.length);
		 
		 if(ready.length === 2) {
			 console.log('both are now ready');
			 ready = [];
			 // console.log(ready);
			 // emit to clients in the room - start the game and hide waiting-page
			 io.to(playRooms[0].id).emit('start:game');
		 };
	  });
 
	  socket.on('opponent:clicked', (reactionTime)=> {
		 console.log(reactionTime);
		 socket.broadcast.to(playRooms[0].id).emit('opponent:reaction', reactionTime);
	  });
  
  }