/**
 * Socket Controller
 */

 const debug = require('debug')('game:socket_controller');

 let io = null; // socket io server instance
 
 // list of rooms and their connected users 
 const playRooms = [
	 {
		 id: 'roomId',
		 name: 'roomName',
		 players: {},
	 }
 ];
 
 let ownPoints;
 let opponentPoints;
 let ready = [];
 let playersDone = [];
 let ReacTimeObj = {};
 let whoWasFastestEachRound = [];
 let rounds = 0;
 let delay;
 
 const resetting = ()=> {
	 ownPoints;
	 opponentPoints;
	 ready = [];
	 playersDone = [];
	 ReacTimeObj = {};
	 whoWasFastestEachRound = [];
	 rounds = 0;
	 delay;
 }
 
 const randomSeconds = () => {
	 delay = Math.floor(Math.random() * 10000);
	 console.log(delay);
	 return delay;
 }
 randomSeconds();
 
 const getAllIndexes = (arr, val) => {
	 let indexes = [];
	 for(let i=0; i< arr.length; i++)
	 if(arr[i]=== val){
		 indexes.push(i);
	 }
	 return indexes;
 }
 
 const handleDisconnect = function() {
	 debug(`Client ${this.id} disconnected`);
 
	 ownPoints;
	 opponentPoints;
	 whoWasFastestEachRound = [];
 
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
 
	 //  socket.on('clicked:on:virus', () => {
	 //     playersWhoClickedOnVirus.push(socket.id);
	 //     if(playersWhoClickedOnVirus.length === 2) {
	 //         playersWhoClickedOnVirus = [];
	 //         io.to(playRooms[0].id).emit('next:round');
			 
	 //     };
	 //  });
 
	 //  socket.on('reaction', (reaction) => {
		 // socket.id 
	 //  });
	  
	  socket.on('player:ready', ()=> {
		 ready.push(socket.id);
		 // console.log(ready);
		 // console.log(ready.length);
		 
		 if(ready.length === 2) {
			 console.log('both are now ready');
			 ready = [];
			 // console.log(ready);
			 // emit to clients in the room - start the game and hide waiting-page
			 io.to(playRooms[0].id).emit('start:game');
			 io.to(playRooms[0].id).emit('get:virus', delay);
 
		 };
	  });
 
	  socket.on('opponent:clicked', (reactionTime)=> {
		 console.log(reactionTime);
		 // ReacTime[socket.id] = reactionTime;
		 // console.log(ReacTime); 
		 
		 // let v  = Object.values(ReacTime);
		 // const min = Math.min(...v); 
		 // debug(min);
 
		 // const k = getKeyByValue(ReacTime, min);
		 // debug(k);
		 // socket.broadcast.to(k).emit('point');
		 
	  });
 
	  socket.on('game:end', ()=> {
		 io.to(playRooms[0].id).emit('end:game');
		  
	  });
 
	  socket.on('clicked:on:virus', (createdTime, clickedTime) => {
		  debug('listening to clicked:on:virus');
		  let reactionTime = (clickedTime - createdTime) / 1000;
		 ReacTimeObj[socket.id] = reactionTime;
		 console.log(ReacTimeObj);
		 if(Object.keys(ReacTimeObj).length === 2) {
			 whoWasFastestEachRound.push(Object.keys(ReacTimeObj)[0]);
			 // debug(Object.keys(ReacTimeObj)[0]);
			 debug(ReacTimeObj);
 
			 ownPoints = getAllIndexes(whoWasFastestEachRound, socket.id).length;
			 
			 debug('I was fastest this many times: ', ownPoints);
 
			 opponentPoints = (whoWasFastestEachRound.length - ownPoints)
			 // debug('Opponents points are: ', opponentPoints);
 
			 const [firstReactionTime, secondReactionTime] = Object.values(ReacTimeObj);
 
			 io.to(Object.keys(ReacTimeObj)[1]).emit('first:both:have:clicked:on:virus', ownPoints, opponentPoints, firstReactionTime, secondReactionTime)
 
 
			 // io.to(Object.keys(ReacTimeObj)[0]).emit('you:got:point', ownPoints, opponentPoints);
			 // io.to(Object.keys(ReacTimeObj)[1]).emit('opponent:got:point', opponentPoints, ownPoints);
		 }
 
	  }); 
 
	  socket.on('sending:back:points', (ownP, oppP, firstReactionTime, secondReactionTime)=> {
 
		 io.to(Object.keys(ReacTimeObj)[0]).emit('second:both:have:clicked:on:virus', ownP, oppP, firstReactionTime, secondReactionTime)
	 });
	 
	 socket.on('both:points:updated', () => {
		 
		 ReacTimeObj = {};
		 rounds++;
 
		 if(rounds === 4) {
			 // kolla vem som har flest poäng
			 let ownPoints = getAllIndexes(whoWasFastestEachRound, socket.id).length;
			 if(ownPoints === 2) {
				 io.to(playRooms[0].id).emit('a:tie');
			 } else if (ownPoints > 2) {
				 io.to(socket.id).emit('i:won');
				 socket.broadcast.to(playRooms[0].id).emit('you:lost');
			 } else {
				 io.to(socket.id).emit('i:lost');
				 socket.broadcast.to(playRooms[0].id).emit('you:won');
			 }
			 
			 resetting();
			 debug('resetting rounds: ', rounds);
			 
		 };
 
		 io.to(playRooms[0].id).emit('points:updated:and:done');
	 });
 
	  socket.on('player:done', () => {
		  ownPoints;
		  opponentPoints;
		  whoWasFastestEachRound = [];
		 playersDone.push(socket.id);
		 if(playersDone.length === 2){
			 io.to(playRooms[0].id).emit('both:players:done');
			 
		 };
	  });
  }