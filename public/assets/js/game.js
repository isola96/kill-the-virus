const socket = io();

const startPageEl = document.querySelector('#startPage');
const usernameForm = document.querySelector('#usernameForm');
const usernameInput = document.querySelector('#username');
const waitingForOpponentEl = document.querySelector('#waitingForOpponent');
const gameEl = document.querySelector('#game');
const boardEl = document.querySelector('#board');
const winnerStartOverEl = document.querySelector('#winnerStartOver');
const btnPlayAgain = document.querySelector('#btnPlayAgain');


let ready = false;
let users = {};
// let users = [{username: Elin, room: 1}, {username: Johanna, room: 1}, {username: Jooheon, room: 2}, {username: IM, room: 2}];
// let room = null;
// let rounds = 0;


// get a random amout of seconds (between 0-10 seconds)
const randomSeconds = () => {
    return Math.floor(Math.random() * 10000);
}

// get a virus at a random position in random amout of time
const getVirus = () => {
    // get a random number between 0-8
	let randomPosition = Math.floor(Math.random() * 9);
	console.log(randomPosition+1);

   // What is going to show in the box
    let virusIcon = `<i class="fa-solid fa-viruses"></i>`;
	setTimeout(function(){
		// find div with id with the random number
		const virus = document.querySelector(`#boardItem${randomPosition}`);
		virus.innerHTML = virusIcon;
    }, randomSeconds());
}

socket.on('user:connected', (userSocketId) => {
    console.log(userSocketId);
});

usernameForm.addEventListener('submit', e => {
    e.preventDefault();
    const username = usernameInput.value;

    if (!username) {
        return;
    }

    users[socket.id] = username   // skicka detta till servern? för att sparas hos andra också?

    // send username to server 
    socket.emit('submit:username', username);

    // if username-input is empty; return
    console.log('This user put username as: ', username);

    
    // socket.emit('user:waiting', users, )

    // create a new room for the player to wait in for an opponent

    // socket.on('user:joined',)

    // toggle classlist
    startPageEl.classList.toggle('hide');
    waitingForOpponentEl.classList.toggle('hide');

    // if someone is waiting send alert
    // någon kod för att vänta på en till spelare
    socket.on('user:joined', (username, socketId) => {

        console.log(username, 'joined waitingroom and has id: ', socketId);
        
        users[socketId] = username;
        console.log(Object.keys(users)[1]);  // JJ id; second player
        

        if(Object.keys(users).length === 2){
            socket.emit('users:waiting', socketId);  
            users = [];
            alert('Click ok to start game!');
            ready = true;
            console.log('ready?', ready);

            waitingForOpponentEl.classList.toggle('hide');
            gameEl.classList.toggle('hide');
            
            getVirus();
        };

        
    });
    
    socket.on('opponent:true', ()=> {
        console.log('There was an opponent for you waiting');
        alert('Click ok to start game!');
        ready = true;
        console.log('ready?', ready);

        waitingForOpponentEl.classList.toggle('hide');
        gameEl.classList.toggle('hide');

        getVirus();

        // see if opponent is ready
        
    });

    let rounds = 0;

    boardEl.addEventListener('click', e => {
        console.log('clicked on board, specific: ', e.target.tagName);
    
        if(e.target.tagName === 'I') {
            rounds++;
            console.log('rounds', rounds);

            if(rounds === 10) {
                // end game
                gameEl.classList.toggle('hide');
                winnerStartOverEl.classList.toggle('hide');

                // skicka till servern att man är klar
            }
            // remove the virus-icon
            e.target.remove();
            
    
            // get a new random position again
            getVirus();
            
        }
    
    });

    btnPlayAgain.addEventListener('click', () => {
        winnerStartOverEl.classList.toggle('hide');
        startPageEl.classList.toggle('hide');
        rounds = 0;

    });


});

