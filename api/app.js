const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const morgan = require('morgan');

const userRouter = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

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

app.use(morgan('dev'));

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

// Routes Middlewares
app.use('/api/v1/users', userRouter);

app.use((req, res, next) => {
  next(new AppError(`cant find ${req.originalUrl} on the server !`, 404));
});

app.use(globalErrorHandler);

module.exports = server;
