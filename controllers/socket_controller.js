/**
* Socket Controller
*/

const debug = require('debug')('game:socket_controller');

let io = null; // socket io server instance

// list of rooms and their connected users 
let playRooms = [
	{
		id: 'roomId',
		players: {},
		time: [],
		points: [],
		rounds: 0,
	}
];

const maxRounds = 10;
let ownPoints = 0;
let opponentPoints = 0;
let ready = [];
let playersDone = [];
let delay;
let randomPosition;
let newObject = {};
let newTimeObj = {};

const findPlayersRoom = function(arr, clientId) {
	for(let i=0; i< arr.length; i++) {
		let [first, second] = Object.keys(arr[i].players);
		if( first === clientId || second === clientId ){
			return i;
		}
	}
};

const resetting = ()=> {
	ownPoints= 0;
	opponentPoints = 0;
	ready = [];
	playersDone = [];
	delay;
	newTimeObj = {};
}

const randomSeconds = () => {
	delay = Math.floor(Math.random() * 10000);
	console.log(delay);
	return delay;
}
randomSeconds();

let getRandomPosition = () => {
	randomPosition = Math.floor(Math.random() * 9)
	return randomPosition
};
getRandomPosition();

const getAllIndexes = (arr, val) => {
	let indexes = [];
	for(let i=0; i< arr.length; i++)
	if(arr[i]=== val){
		indexes.push(i);
	}
	return indexes;
}

const handleDisconnect = function() {

	resetting();

	// find the room that this socket is part of
	const room = playRooms.find(playroom => playroom.players.hasOwnProperty(this.id));

	// if socket was not in a room, do not broadcast
	if (!room) {
		return;
	}

	room.points = [];
	room.rounds = 0;
	room.time = [];
	
	// let everyone in the room know that this user has disconnected
	this.broadcast.to(room.id).emit('player:disconnected', room.players[this.id]);
	
	// remove players from that room
	room.points = [];
	room.rounds = 0;
	room.time = [];
	room.players = {};
};

// Handle when a user has joined the chat
const handlePlayerJoined = function(username, callback) {

	// check if there is a spot open for the player in a room
	let index = playRooms.findIndex(obj => {
		return Object.keys(obj.players).length < 2;
	});

	if(index === -1) {
		newObject.id = (playRooms.length);
		newObject.players = {};
		newObject.points = [];
		newObject.time = [];
		newObject.rounds = 0;
		playRooms.push(newObject);

		index = (playRooms.length-1);
	}

	// join room
	this.join(playRooms[index].id);

	let obj = playRooms[index].players;
	obj[this.id] = username;
	
	// let everyone know that someone has connected to the chat
	this.broadcast.to(playRooms[findPlayersRoom(playRooms, this.id)].id).emit('player:connected', username);
	
	// confirm join
	callback({
		success: true,
		id: playRooms[findPlayersRoom(playRooms, this.id)].id,
		players: playRooms[findPlayersRoom(playRooms, this.id)].players
	});
	
	// broadcast list of users in room to all connected sockets EXCEPT ourselves
	this.broadcast.to(playRooms[findPlayersRoom(playRooms, this.id)].id).emit('player:list', playRooms[findPlayersRoom(playRooms, this.id)].players);
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
		
		if(ready.length === 2) {
			ready = [];
			const playerUsernames = playRooms[findPlayersRoom(playRooms, socket.id)].players;

			randomSeconds();
			getRandomPosition();

			// emit to clients in the room - start the game and hide waiting-page
			io.to(playRooms[findPlayersRoom(playRooms, socket.id)].id).emit('start:game', playerUsernames);

			io.to(playRooms[findPlayersRoom(playRooms, socket.id)].id).emit('get:virus', delay, randomPosition);
		};
	});

	socket.on('game:end', ()=> {
		io.to(playRooms[findPlayersRoom(playRooms, socket.id)].id).emit('end:game');
	});

	socket.on('clicked:on:virus', (createdTime, clickedTime) => {
		// r??kna ut reaktionstid
		let reactionTime = (clickedTime - createdTime) / 1000;
		// save reactionTime in playRooms, create a new object with socket.id as key and reactionTime as value
		let roomIndex = playRooms[findPlayersRoom(playRooms, socket.id)];

		// save the reactionTimes in object
		newTimeObj = {}
		newTimeObj.playerSocketId = socket.id;
		newTimeObj.reacTime = reactionTime;
		roomIndex.time.push(newTimeObj);

		if(roomIndex.time.length === 2) {
			// save who was the fastest and slowest
			let [fastestPlayer, fastestTime] = Object.values(roomIndex.time[0]);
			let [slowestPlayer, slowestTime] = Object.values(roomIndex.time[1]);

			roomIndex.points.push(fastestPlayer);

			// get how many points each player have and send it 
			let ownPoints = getAllIndexes(roomIndex.points, socket.id).length;
			let opponentPoints = (roomIndex.rounds + 1) - ownPoints;

			io.to(slowestPlayer).emit('first:both:have:clicked:on:virus', ownPoints, opponentPoints, fastestTime, slowestTime, fastestPlayer);

			// delete the reactionTime in object and create it again
			delete roomIndex.time;
			roomIndex.time = [];
		}
	}); 

	socket.on('sending:back:points', (ownP, oppP, firstReactionTime, secondReactionTime, fastestPlayer)=> {
		io.to(fastestPlayer).emit('second:both:have:clicked:on:virus', ownP, oppP, firstReactionTime, secondReactionTime)
	});
	
	socket.on('both:points:updated', (ownP) => {
		let roomIndex = playRooms[findPlayersRoom(playRooms, socket.id)];
		roomIndex.rounds++;

		if(roomIndex.rounds === maxRounds) {
			// tell everyone who won
			if(ownP === maxRounds/2) {
				io.to(playRooms[findPlayersRoom(playRooms, socket.id)].id).emit('a:tie');

				roomIndex.points = [];
				roomIndex.rounds = 0;
				roomIndex.time = [];
				roomIndex.players = {};
				return
			} else if (ownP > maxRounds/2) {
				io.to(socket.id).emit('i:won');
				socket.broadcast.to(playRooms[findPlayersRoom(playRooms, socket.id)].id).emit('you:lost');

				roomIndex.points = [];
				roomIndex.rounds = 0;
				roomIndex.time = [];
				roomIndex.players = {};
				return
			} else {
				io.to(socket.id).emit('i:lost');
				socket.broadcast.to(playRooms[findPlayersRoom(playRooms, socket.id)].id).emit('you:won');

				roomIndex.points = [];
				roomIndex.rounds = 0;
				roomIndex.time = [];
				roomIndex.players = {};
				return
			}
		};

		randomSeconds();
		getRandomPosition();

		io.to(playRooms[findPlayersRoom(playRooms, socket.id)].id).emit('points:updated:and:done', delay, randomPosition);
	});

	socket.on('player:done', () => {
		playersDone.push(socket.id);
		if(playersDone.length === 2){
			io.to(playRooms[findPlayersRoom(playRooms, socket.id)].id).emit('both:players:done');
		};
	});
}