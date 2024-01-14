const canvas = document.getElementById('gameCanvas')
canvas.focus();

const ctx = canvas.getContext('2d')
const socket = io();

const avatarImage = new Image();
avatarImage.src = "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D"
const obstacleImage = new Image();
obstacleImage.src = 'images/obstacle.png'; // You need to have an obstacle image

let players = {};
let obstacles = [];
let gameOver = false;


socket.on('playerUpdate', (updatedPlayers) => {
    players = updatedPlayers;
    if (!gameOver) {
        drawGame();
    }
});


socket.on('chatMessage', (message) => {
    displayChatMessage(message);
})

const chatInput = document.getElementById('chatInput');
chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const message = chatInput.value;
        if (message.trim() !== '') {
            socket.emit('chatMessage', message);
            chatInput.value = '';
        }
    }
});


socket.on('scoreUpdate', (updatedPlayers) => {
    players = updatedPlayers;
    if (!gameOver) {
        drawGame();
    }
});

socket.on('obstacleUpdate', (updatedObstacles) => {
    obstacles = updatedObstacles;
    if (!gameOver) {
        drawGame();
    }
});

// Listen for game-over event from the server
socket.on('gameOver', () => {
    gameOver = true;
    drawGameOver();
});

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawObstacles();
    drawPlayers();
}



window.addEventListener('keydown', (e) => {
    console.log(`Key pressed: ${e.code}`);
    const movement = { playerId: socket.id, key: e.code };
    socket.emit('movement', movement);
  });






window.addEventListener('keydown', (e) => {
    if (e.key === 'r' && gameOver) {
        socket.emit('restartGame');
        gameOver = false;
        drawGame();
    }
});


function displayChatMessage(message) {
    // we are showing messages in div
    const chatLog = document.getElementById('chatLog');
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    chatLog.appendChild(messageElement);

    // Optional: Scroll to the bottom of the chat log
    chatLog.scrollTop = chatLog.scrollHeight;
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawObstacles();
    drawPlayers();
}
