const socket = io();

const startPageEl = document.querySelector('#startPage');
const gameEl = document.querySelector('#game');
const waitingForOpponentEl = document.querySelector('#waitingForOpponent');
const playersOnline = document.querySelector('#online-users');
const usernameForm = document.querySelector('#usernameForm');
const usernameInput = document.querySelector('#username');

let users = [];

// tell server that another user has connected
socket.on('user:connected', () => {
    console.log('someone connected') 
});

usernameForm.addEventListener('submit', e => {
    e.preventDefault();

    const username = usernameInput.value;

    console.log('someone put username as: ', username);

    users.push(username);   // skicka detta till servern? för att sparas hos andra också?
    // socket.emit('user:waiting', username, )

    socket.emit('user:waiting', username, (status) => {
		console.log("Waiting for a user", status);
    });

    // toggle classlist
    startPageEl.classList.toggle('hide');
    waitingForOpponentEl.classList.toggle('hide');

    // någon kod för att vänta på en till spelare
    
    // skicka prompt och fråga om spelare är redo
    alert('Click ok to start game!');

    // show game and hide waiting
    gameEl.classList.toggle('hide');
    waitingForOpponentEl.classList.toggle('hide');
});
