const express = require('express');
const app = express();
const http = require('http');
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const users = [];

io.on('connection', (socket) => {
    let currentUser = '';
    console.log('a user connected');

    socket.on('online', username => {
        socket.join('chatroom'); // Join a private-room (can be used login here, we can also use PubSub Model)
        currentUser = username;
        users.push(username);
        io.emit('updateOnlineUsers', users);
    });

    socket.on('chatMessage', (data) => {
        console.log('message: ' + data.message);
        // socket.to('chatroom').emit('chatMessage', data); // Send message to private room
        // socket.emit('chatMessage', data); // sends message to only sender client
        // socket.broadcast.emit('chatMessage', data); // to broadcast it to everone except the sender client
        io.emit('chatMessage', data); // to broadcast it to everyone
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
        const index = users.indexOf(currentUser);
        index != -1 && users.splice(index, 1);
        io.emit('updateOnlineUsers', users);
    });
});

server.listen(3000, () => {
    console.log('listening on port 3000');
});