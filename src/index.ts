import express from "express";
import { createServer } from "http";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { Server } from "socket.io";

const app = express();

//manually creating a server instead of  Express’s built-in one (This is useful when you need to extend the server’s functionality, like:
//*Using WebSockets (socket.io).
//*Handling both HTTP and WebSocket connections on the same server.
//)
const server = createServer(app);

//This binds Socket.io to the same HTTP server.
const io = new Server(server, {
    connectionStateRecovery: {}
});


const _dirname = dirname(fileURLToPath(import.meta.url))
app.get("/", (req, res) => {
    res.sendFile(join(_dirname, '../src/index.html'))

});

// I listen on the connection event for incoming sockets 
io.on('connection', (socket) => {
    console.log("a user connected");

    socket.on('disconnect', () => {
        console.log("user disconnected")
    })

    socket.on('chat message', (message) => {
        io.emit('chat message', message);

        console.log("message: ", message)
    })
})

server.listen(3000, () => {
    console.log("server running at http://localhost:3000")
})