/**
 * Socket Controller
 */

const debug = require('debug')('game:socket_controller');

let io = null; // socket io server instance

// list of rooms and their connected users 
const rooms = [
	{
		name: 'room 1',
		users: {}
	},
	{
		name: 'room 2',
		users: {}
	}
];
const usersInWaitingRoom = [];

// a user joins the waiting room 
const handleUserJoined = function(username, callback) {
	debug(`User ${username} with socket id ${this.id} wants to join the waiting room`);

	usersInWaitingRoom.push(username);

	if (waitingRoom.length == 2) {
	}

};

// start game 
const startGame = function (player1, player2) {

};

module.exports = function(socket, _io) {
	io = _io;

	// skickar till game.js, det jag skriver som parameter kommer att visa/ och skriva ut socket.id:t
	// socket.broadcast.emit('user:connected', socket.id);

	debug('a new client has connected', socket.id);

	io.emit("new-connection", "A new user has connected");

	socket.emit('user:connected', socket.id);

	// listen to client submitting username
	socket.on('submit:username', (username) => {
		console.log(username, 'joined waitingroom');
		socket.broadcast.emit('user:joined', username, socket.id);

	});

	socket.on('users:waiting', (socketId) => {
		socket.to(socketId).emit('opponent:true');
	})

	socket.on('user:ready', (socketId, msg) => {
		socket.to(socketId).emit('opponent:ready', msg);
	});


}