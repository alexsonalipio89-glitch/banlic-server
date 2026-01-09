const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // allow all origins for now
    methods: ['GET', 'POST']
  }
});

// When a passenger connects
io.on('connection', (socket) => {
  console.log('A client connected');

  socket.on('passenger-location', (data) => {
    console.log('Passenger location:', data);
    // broadcast location to all drivers
    socket.broadcast.emit('passenger-update', data);
  });

  socket.on('disconnect', () => {
    console.log('A client disconnected');
  });
});

// Use Railway port if provided, otherwise default to 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


