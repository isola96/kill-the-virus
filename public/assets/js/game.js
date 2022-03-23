// const { getRounds } = require("bcrypt");

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

let rounds = 0;
let ready = [];
let players = {};
let delay;
let clickedTime;
let reactionTime;
let createdTime;

let room = null;
let username = null;


// get a random amout of seconds (between 0-10 seconds) 
// måste skötas på server-sidan
const randomSeconds = () => {
    delay = Math.floor(Math.random() * 10000);
    console.log(delay);
    return delay;
}

// get a virus at a random position in random amout of time
const getVirus = () => {
    // get a random number between 0-8
	let randomPosition = Math.floor(Math.random() * 9);
	console.log(randomPosition+1);

   // What is going to show in the box
    let virusIcon = `<i id="virus" class="fa-solid fa-viruses"></i>`;
	setTimeout(function(){
		// find div with id with the random number
		const virus = document.querySelector(`#boardItem${randomPosition}`);
		virus.innerHTML = virusIcon;

        createdTime = Date.now();

    }, randomSeconds());
}


const addPlayerToWaitingList = text => {
    const liEl = document.createElement('li');
    liEl.innerText = text;

    ulWaitingListEl.appendChild(liEl);
};

const updatePlayersList = players => {
    ulWaitingListEl.innerHTML = Object.values(players).map(username => `<li>${username} is now waiting</li>`).join("");

    if(Object.values(players).length === 2){
        alert(`two players are waiting: ${Object.values(players)}, you ready?`);
        // console.log(socket.id);
        socket.emit('player:ready');

    };
};


// listen for when a user disconnects
socket.on('player:disconnected', (username) => {
	console.log(`${username} disconnected 😢`);
    alert(`${username} disconnected 😢`);

    // reset variables and stuff
});

// listen for when a new player connects to waitingroom
socket.on('player:connected', (id) => {
    console.log(id);
    // addPlayerToWaitingList();
});

// listen for when we receive an updated list of online users (in this room)
socket.on('player:list', players => {
	updatePlayersList(players);
});

socket.on('start:game', () => {
    console.log('gonna start the game');
    // show game 
    waitingForOpponentEl.classList.toggle('hide');
    gameEl.classList.toggle('hide');

    
    // get virus going
    getVirus();

    // listen for opponent's clicks
    socket.on('opponent:reaction', (oppReac)=> {
        document.querySelector('#player2Score').innerText = oppReac;
        
        // check who was faster, glöm inte att tänka på rounds!
        if (oppReac > reactionTime) {
            console.log('I was faster');
        }
    });

    boardEl.addEventListener('click', (e) => {
        // Time when clicked
        clickedTime = Date.now();
        console.log(clickedTime);
        // Get in seconds 
        reactionTime = (clickedTime - createdTime) / 1000;
        document.querySelector('#youScore').innerText = reactionTime;

        if(e.target.tagName === 'I') {
            rounds++;
            e.target.remove();

            // send reaktionTime to server
            socket.emit('opponent:clicked', reactionTime);

            if(rounds === 3) {
                // end game 
                alert('Game over! Winner is: ');
                gameEl.classList.toggle('hide');
                winnerStartOverEl.classList.toggle('hide');
            };

            getVirus();


        };

        
    });

});


usernameForm.addEventListener('submit', e => {
    e.preventDefault();
    username = usernameInput.value;

    if (!username) {
        return;
    }

    console.log(`${username} is on waiting-page`);

    socket.emit('player:joined', username, (status) => {
        console.log('Server acknowledged that user joined', status);

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
    rounds = 0;
});