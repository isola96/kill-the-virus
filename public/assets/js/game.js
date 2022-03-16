const socket = io();

const startPageEl = document.querySelector('#startPage');
const usernameForm = document.querySelector('#usernameForm');
const usernameInput = document.querySelector('#username');
const waitingForOpponentEl = document.querySelector('#waitingForOpponent');

let users = [];
// let room = null;

usernameForm.addEventListener('submit', e => {
    e.preventDefault();

    // if username-input is empty; return
    if (!usernameInput.value) {
		return;
	}

    // create a room for the player to wait for an opponent

    console.log(usernameInput.value);

    // toggle classlist
    startPageEl.classList.toggle('hide');
    waitingForOpponentEl.classList.toggle('hide');
});