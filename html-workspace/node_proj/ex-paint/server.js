const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index');
});

let users = [];
let currentDrawerIndex = 0;

io.on('connection', (socket) => {
    socket.on('join', () => {
        users.push(socket.id);

        if (users.length === 1) {
            io.to(socket.id).emit('drawer');
        }

        io.emit('userCount', users.length);
        io.emit('currentDrawer', users[currentDrawerIndex]);
    });

    socket.on('disconnect', () => {
        users = users.filter(user => user !== socket.id);

        if (socket.id === users[currentDrawerIndex]) {
            currentDrawerIndex = (currentDrawerIndex + 1) % users.length;
            if (users.length === 0) {
                io.emit('currentDrawer', null);
            } else {
                io.emit('currentDrawer', users[currentDrawerIndex]);
            }
        }

        io.emit('userCount', users.length);
    });

    socket.on('start', (data) => {
        socket.broadcast.emit('start', data);
    });

    socket.on('draw', (data) => {
        socket.broadcast.emit('draw', data);
    });

    socket.on('nextTurn', () => {
        if (socket.id === users[currentDrawerIndex]) {
            currentDrawerIndex = (currentDrawerIndex + 1) % users.length;
            io.emit('currentDrawer', users[currentDrawerIndex]);
        }
    });

    socket.on('clearCanvas', () => {
        socket.broadcast.emit('clearCanvas');
    });
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
