const socket = io();

const startPageEl = document.querySelector('#startPage');
const usernameForm = document.querySelector('#usernameForm');
const usernameInput = document.querySelector('#username');
const waitingForOpponentEl = document.querySelector('#waitingForOpponent');
const gameEl = document.querySelector('#game');


let users = [];
// let users = [{username: Elin, room: 1}, {username: Johanna, room: 1}, {username: Jooheon, room: 2}, {username: IM, room: 2}];
// let room = null;
// let rounds = 0;

usernameForm.addEventListener('submit', e => {
    e.preventDefault();

    const username = usernameInput.value;

    // if username-input is empty; return
    if (!username) {
		return;
	}
    console.log('someone put username as: ', username);

    users.push(username);   // skicka detta till servern? för att sparas hos andra också?
    // socket.emit('user:waiting', username, )

    // see if there's a player waiting 
    // create a new room for the player to wait in for an opponent


    // tell server a user is ready to... wait
    // socket.on('user:joined',)

    // tell server that another user has connected
    socket.on('user:connected', () => {
        console.log('someone connected') 
    });

    // toggle classlist
    startPageEl.classList.toggle('hide');
    waitingForOpponentEl.classList.toggle('hide');

    // någon kod för att vänta på en till spelare
    

    // skicka prompt och fråga om spelare är redo
    alert('Click ok to start game!');

    gameEl.classList.toggle('hide');


});