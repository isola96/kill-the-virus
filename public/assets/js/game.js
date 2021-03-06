const socket = io();

const startPageEl = document.querySelector('#startPage');
const gameEl = document.querySelector('#game');
const waitingForOpponentEl = document.querySelector('#waitingForOpponent');
const usernameForm = document.querySelector('#usernameForm');
const usernameInput = document.querySelector('#username');
const boardEl = document.querySelector('#board');
const winnerStartOverEl = document.querySelector('#winnerStartOver');
const btnPlayAgain = document.querySelector('#btnPlayAgain');
const yourScoreEl = document.querySelector('#you');
const opponentWaitingEl = document.querySelector('#opponentWaiting');
const ulWaitingListEl = document.querySelector('#ulWaitingList');
const youPointsEl = document.querySelector('#youPoints');
const player2PointsEl = document.querySelector('#player2Points');
const player2ScoreEl = document.querySelector('#player2Score');
const youScoreEl = document.querySelector('#youScore');
const youUsernameEl = document.querySelector('#youUsername')
const player2UsernameEl = document.querySelector('#player2Username')

let ready = [];
let players = {};
let delay;
let clickedTime;
let reactionTime;
let createdTime;
let room = null;
let username = null;
let myPoints = 0;
let opponentPoints = 0;

const getVirus = (d, rp) => {
    let virusIcon = `<i id="virus" class="fa-solid fa-viruses"></i>`;
    setTimeout(function(){
        // find div with id with the random number
        const virus = document.querySelector(`#boardItem${rp}`);
        virus.innerHTML = virusIcon;

        createdTime = Date.now();
    }, d);
}

const addPlayerToWaitingList = text => {
    const liEl = document.createElement('li');
    liEl.innerText = text;
    ulWaitingListEl.appendChild(liEl);
};

const updatePlayersList = players => {
    ulWaitingListEl.innerHTML = Object.values(players).map(username => `<li>${username} is now waiting</li>`).join("");

    if(Object.values(players).length === 2){
        alert(`You have an opponent, click ok to start game`);
        socket.emit('player:ready');
    };
};

// listen for when a user disconnects
socket.on('player:disconnected', (username) => {
    alert(`${username} disconnected ????`);
    location.reload()
});

// listen for when a new player connects to waitingroom
socket.on('player:connected', (id) => {
    console.log(id);
});

// listen for when we receive an updated list of online users (in this room)
socket.on('player:list', players => {
	updatePlayersList(players);
});

socket.on('start:game', (playerUsernames) => {
    // show game 
    waitingForOpponentEl.classList.toggle('hide');
    gameEl.classList.toggle('hide');
    youUsernameEl.innerText = username;
    const usernamesArray = Object.values(playerUsernames)
    let opponentUsername = usernamesArray.find(a => a !== username);
    if (!opponentUsername) {
        opponentUsername = username
    }
    player2UsernameEl.innerText = opponentUsername;

    // get virus going
    socket.on('get:virus', (delay, randomPosition) => {
        getVirus(delay, randomPosition);
    });
    
    boardEl.addEventListener('click', (e) => {
        if(e.target.tagName === 'I') {
            clickedTime = Date.now();
            socket.emit('clicked:on:virus', createdTime, clickedTime);
            e.target.remove();
        };
    });
});

usernameForm.addEventListener('submit', e => {
    e.preventDefault();

    username = usernameInput.value;

    if (!username) {
        return;
    }

    socket.emit('player:joined', username, (status) => {
        if(status.success) {
            // show waiting-page
            startPageEl.classList.toggle('hide');
            waitingForOpponentEl.classList.toggle('hide');

            // update list of users in room
			updatePlayersList(status.players);
        }
    });   
});

btnPlayAgain.addEventListener('click', () => {
    winnerStartOverEl.classList.toggle('hide');
    startPageEl.classList.toggle('hide');
});

socket.on('first:both:have:clicked:on:virus', (ownP, oppP, firstReactionTime, secondReactionTime, fastestPlayer) => {
    // show points
    youPointsEl.innerText = ownP;
    player2PointsEl.innerText = oppP;
    youScoreEl.innerText = secondReactionTime;
    player2ScoreEl.innerText = firstReactionTime;
    
    socket.emit('sending:back:points', ownP, oppP, firstReactionTime, secondReactionTime, fastestPlayer);

});

socket.on('second:both:have:clicked:on:virus', (oppP, ownP, firstReactionTime, secondReactionTime) => {
    // show points
    youPointsEl.innerText = ownP;
    player2PointsEl.innerText = oppP;
    youScoreEl.innerText = firstReactionTime;
    player2ScoreEl.innerText = secondReactionTime;
    socket.emit('both:points:updated', ownP);
});

socket.on('points:updated:and:done', (delay, randomPosition) => {
    getVirus(delay, randomPosition);
});

socket.on('a:tie', () => {
    alert('Game over! It was a tie');
    location.reload();
});

socket.on('i:won', () => {
    alert('You won!');
    location.reload();
});

socket.on('you:lost', () => {
    alert('You lost!');
    location.reload();
});

socket.on('i:lost', () => {
    alert('You lost!');
    location.reload();
});

socket.on('you:won', () => {
    alert('You won!');
    location.reload();
});