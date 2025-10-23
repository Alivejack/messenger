const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
});

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

io.on('connection', (socket) => {
  console.log('🟢 a user connected');

  socket.on('chatMessage', (msg) => {
    console.log('💬 Message received:', msg);

    io.emit('chatMessage', msg);
  });

  socket.on('disconnect', () => {
    console.log('🔴 user disconnected');
  });
});

module.exports = server;
