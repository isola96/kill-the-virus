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
const waitingRoom = [];

// a user joins the waiting room 
const handleUserJoined = function(username, callback) {
	debug(`User ${username} with socket id ${this.id} wants to join the waiting room`);

	waitingRoom.push(username);

	if (waitingRoom.length == 2) {
	}

};

// start game 
const startGame = function (player1, player2) {

};

module.exports = function(socket, _io) {
	io = _io;

	socket.broadcast.emit('user:connected', socket.id);

	debug('a new client has connected', socket.id);

	io.emit("new-connection", "A new user has connected")
}