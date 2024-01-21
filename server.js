const express = require('express')
const http = require('http')
const socketIO = require('socket.io')



const app = express()
const server = http.createServer(app);
const io = socketIO(server)


const PORT = process.env.PORT || 3030;

app.use(express.static('public'))

let players = {};
let obstacles = [];
let gameOver = false;

io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // Initialize player data
  players[socket.id] = { x: 100, y: 100, score: 0 };

  // Send the initial game state to the new player
  socket.emit('playerUpdate', players);
  socket.emit('obstacleUpdate', obstacles);

  // Broadcast player connection to other clients
  socket.broadcast.emit('playerUpdate', players);

  // Listen for player movements
  socket.on('movement', (movement) => {
    console.log(`Player ${movement.playerId} moved: ${movement.key}`);
    if (!gameOver) {
      handlePlayerMovement(socket.id, movement.key);
      io.emit('playerUpdate', players);

      // Check for collisions with obstacles
      if (checkObstacleCollision(socket.id)) {
        handleGameOver(socket.id);
      }
    }
  });

  // Listen for chat messages
  socket.on('chatMessage', (message) => {
    const playerName = socket.id;
    const chatMessage = `${playerName}: ${message}`;
    io.emit('chatMessage', chatMessage);
  });

  // Increase player score and broadcast the updated scores
  socket.on('increaseScore', () => {
    if (!gameOver) {
      players[socket.id].score += 1;
      io.emit('scoreUpdate', players);
    }
  });

  // Handle collisions with obstacles
  socket.on('checkCollision', () => {
    if (!gameOver && checkObstacleCollision(socket.id)) {
      handleGameOver(socket.id);
    }
  });

  // Listen for restart game requests
  socket.on('restartGame', () => {
    resetGame();
    io.emit('playerUpdate', players);
    io.emit('obstacleUpdate', obstacles);
    io.emit('scoreUpdate', players);
  });
});


function  handlePlayerMovement(playerId, key) {
    const player = players[playerId];
    const speed = 5;
  
    switch (key) {
      case 'ArrowUp':
        player.y -= speed;
        console.log('wor?')
        break;
      case 'ArrowDown':
        player.y += speed;
        break;
      case 'ArrowLeft':
        player.x -= speed;
        break;
      case 'ArrowRight':
        player.x += speed;
        break;
    }
  }

  function checkObstacleCollision(playerId) {
    if (gameOver) {
      return false;
    }
  
    const player = players[playerId];
    for (const obstacle of obstacles) {
      if (
        player.x < obstacle.x + 50 &&
        player.x + 50 > obstacle.x &&
        player.y < obstacle.y + 50 &&
        player.y + 50 > obstacle.y
      ) {
        // Collision detected
        return true;
      }
    }
    return false;
  }

  function handleGameOver(playerId) {
    gameOver = true;
    io.emit('gameOver');
  
    // You can implement additional logic for handling game over, such as saving high scores.
  }

  
  function resetGame() {
    gameOver = false;
    obstacles = generateObstaclePositions();
    Object.keys(players).forEach((playerId) => {
      players[playerId].x = 100;
      players[playerId].y = 100;
      players[playerId].score = 0;
    });
  }

  function generateObstaclePositions(canvas) {
    const defaultWidth = 800; // Set your default canvas width here
    const defaultHeight = 600; // Set your default canvas height here
  
    const newObstacles = [];
    for (let i = 0; i < 5; i++) {
      const obstacle = {
        x: Math.floor(Math.random() * (canvas?.width || defaultWidth) - 50),
        y: Math.floor(Math.random() * (canvas?.height || defaultHeight) - 50),
      };
      newObstacles.push(obstacle);
    }
    return newObstacles;
  }

  setInterval(() => {
    obstacles = generateObstaclePositions();
    io.emit('obstacleUpdate', obstacles);
  }, 5000); // Update obstacles every 5 seconds
  


server.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`)
})