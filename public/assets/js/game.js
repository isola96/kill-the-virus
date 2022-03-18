const socket = io();

const startPageEl = document.querySelector('#startPage');
const usernameForm = document.querySelector('#usernameForm');
const usernameInput = document.querySelector('#username');
const waitingForOpponentEl = document.querySelector('#waitingForOpponent');
const gameEl = document.querySelector('#game');
const boardEl = document.querySelector('#board');


let users = [];
// let users = [{username: Elin, room: 1}, {username: Johanna, room: 1}, {username: Jooheon, room: 2}, {username: IM, room: 2}];
// let room = null;
// let rounds = 0;

socket.on('user:connected', () => {
    console.log('someone connected') 
});

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

    // toggle classlist
    startPageEl.classList.toggle('hide');
    waitingForOpponentEl.classList.toggle('hide');

    // någon kod för att vänta på en till spelare
    

    // skicka prompt och fråga om spelare är redo
    alert('Click ok to start game!');

    gameEl.classList.toggle('hide');
    waitingForOpponentEl.classList.toggle('hide');

    getVirus();



    boardEl.addEventListener('click', e => {
        console.log('clicked on board, specific: ', e.target.tagName);
    
        if(e.target.tagName === 'I') {
            // remove the virus-icon
            e.target.remove();
    
            // get a new random position again
            getVirus();
            
        }
    
    });



});