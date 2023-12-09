const express = require('express')
const http = require('http')
const socketIO = require('socket.io')



const app = express()
const server = http.createServer(app);
const io = socketIO(server)


const PORT = process.env.PORT || 3030;

app.use(express.static('public'))








server.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`)
})