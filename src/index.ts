import express from "express";
import { createServer } from "http";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();

//manually creating a server instead of  Express’s built-in one (This is useful when you need to extend the server’s functionality, like:
//*Using WebSockets (socket.io).
//*Handling both HTTP and WebSocket connections on the same server.
//)
const server = createServer(app);

//This binds Socket.io to the same HTTP server.
const io = new Server(server, {
    //for reloads and disconnections
    connectionStateRecovery: {}
});


const _dirname = dirname(fileURLToPath(import.meta.url))
app.get("/", (req, res) => {
    res.sendFile(join(_dirname, '../src/index.html'))

});

// I listen on the connection event for incoming sockets 
io.on('connection', async (socket) => {
    console.log("a user connected");

    socket.on('disconnect', () => {
        console.log("user disconnected")
    })

    socket.on('chat message', async (msg) => {
        try {
            //store msg in db
            const message = await prisma.message.create({
                data: {
                    content: msg
                }
            })

            //send msg with Id(serveroffset) to all the clients
            io.emit('chat message', message.content, message.id);
        } catch (e) {
            console.log("error saving msg", e)
        }

        console.log("message: ", msg)
    });

    if (!socket.recovered) {
        // Fetch missing messages from the database for client recovery
        try {
            const messages = await prisma.message.findMany({
                where: { id: { gt: socket.handshake.auth.serveroffset || 0 } },
                orderBy: {
                    id: "asc"
                }
            });

            //loop through each message and emit their content and id
            messages.forEach(({ id, content }) => {
                console.log('Emitting:', content, id);

                socket.emit("chat message", content, id)
            })


        } catch (e) {
            console.log(e)
        }

    }
})

server.listen(3000, () => {
    console.log("server running at http://localhost:3000")
})