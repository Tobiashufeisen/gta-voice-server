const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

let callQueue = [];
let adminSocket = null;

io.on('connection', (socket) => {
  console.log('Client verbunden:', socket.id);

  socket.on('register_admin', () => {
    adminSocket = socket;
    adminSocket.emit('queue_update', callQueue);
  });

  socket.on('enqueue_call', (userId) => {
    if (!callQueue.includes(userId)) {
      callQueue.push(userId);
      if (adminSocket) {
        adminSocket.emit('queue_update', callQueue);
      }
    }
  });

  socket.on('accept_call', (userId) => {
    callQueue = callQueue.filter(id => id !== userId);
    io.emit('call_accepted', userId);
    if (adminSocket) {
      adminSocket.emit('queue_update', callQueue);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('Server läuft auf Port', PORT);
});
