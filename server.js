const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

let passengers = [];

io.on('connection', (socket) => {
  socket.on('passengerLocation', (data) => {
    passengers = passengers.filter(p => p.id !== socket.id);
    passengers.push({ id: socket.id, ...data });
    io.emit('passengers', passengers);
  });

  socket.on('driverLocation', (data) => {
    io.emit('passengers', passengers);
  });

  socket.on('disconnect', () => {
    passengers = passengers.filter(p => p.id !== socket.id);
    io.emit('passengers', passengers);
  });
});

server.listen(process.env.PORT || 3000, () => console.log('Server running'));
