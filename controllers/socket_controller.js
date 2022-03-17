/**
 * Socket Controller
 */

const debug = require('debug')('game:socket_controller');

let io = null; // socket io server instance

// list of rooms and their connected users 
const rooms = [];


// Handle user disconnect
const handleDisconnect = function() {
	debug(`Client ${this.id} disconnected :(`);

	// find the room that this socket is part of 
	const room = rooms.find(chatroom => (chatroom.users.hasOwnProperty(this.id)));

	// if socket was not in a room, don't broadcast 
	if (!room) {
		return;
	};

	// let everyone in the room know that this user has disconnected
	this.broadcast.to().emit('user:disconnected', room.users[this.id]);

	// remove user from list of connected users in that room
	delete users[this.id];
};

// Handle when a user joins the chat
const handleUserJoined = function(username, room_id, callback) {
	debug(`User ${username} with socket id ${this.id}`);

	// join room
	this.join(room_id);

	// add socket to list of online users in this room
	// a) find room objects with `id` === `general`
	const room = rooms.find(chatroom => chatroom.id === room_id);

	// b) add socket to room's `users` object 
	room.users[this.id] = username;

	// let everyone know that someone has connected to the chat
	this.broadcast.to(room.id).emit('user:connected', username);

	// confirm join
	callback({
		success: true,
		users: rooms.users
	});
};

// Handle user emitting a new message
const handleChatMessage = function(message) {
	debug('Someone said something: ', message);

	// emit `chat:message` event to everyone EXCEPT the sender
	this.broadcast.to(message.room).emit('chat:message', message);
};

module.exports = function(socket, _io) {
	io = _io;

	// broadcast that a new user connected
	socket.broadcast.emit('user:connected');

	debug('a new client has connected', socket.id);

	io.emit("new-connection", "A new user has connected")

	// handle user disconnect
	socket.on('disconnect', handleDisconnect);

	// handle user joined
	socket.on('user:joined', handleUserJoined);

	// handle user emitting a new message
	socket.on('chat:message', handleChatMessage);
}