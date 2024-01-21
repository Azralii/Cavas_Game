const canvas = document.getElementById('gameCanvas')
canvas.focus();

const ctx = canvas.getContext('2d')
const socket = io();

const avatarImage = new Image();
avatarImage.src = "/images/boy-running.gif"
const obstacleImage = new Image();
obstacleImage.src = 'images/obstacle.png'; // You need to have an obstacle image

const groundImage = new Image();
groundImage.src = 'https://s3.envato.com/files/245059404/GameBG%20(2).png'




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
    // ctx.drawImage(groundImage, 0, 0, canvas.width, canvas.height);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawObstacles();
    drawPlayers();
}



window.addEventListener('keydown', (e) => {
    console.log(`Key pressed: ${e.code}`);
    const movement = { playerId: socket.id, key: e.code };
    socket.emit('movement', movement);
  });

function drawPlayers() {
    Object.values(players).forEach((player) => {
        ctx.drawImage(avatarImage, player.x, player.y, 50, 50);

        // Display player scores
        ctx.fillStyle = '#000';
        ctx.font = '14px Arial';
        ctx.fillText(`Score: ${player.score}`, player.x, player.y - 10);
    });
}

// Draw obstacles on the canvas
function drawObstacles() {
    obstacles.forEach((obstacle) => {
        ctx.drawImage(obstacleImage, obstacle.x, obstacle.y, 50, 50);
    });
}


function drawGameOver() {
    ctx.fillStyle = '#000';
    ctx.font = '30px Arial';
    ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2 - 15);
    ctx.font = '16px Arial';
    ctx.fillText('Press R to restart', canvas.width / 2 - 90, canvas.height / 2 + 20);
}


window.addEventListener('keydown', (e) => {
    if (e.key === 'r' && gameOver) {
        socket.emit('restartGame');
        gameOver = false;
        drawGame();
    }
});


function displayChatMessage(message) {
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
