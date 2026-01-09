const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "*", // allow all origins
    methods: ["GET", "POST"]
  }
});

// Listen for connections
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);

  // Receive passenger location
  socket.on('passenger-location', (data) => {
    console.log('Passenger location:', data);
    // Broadcast to all drivers (or everyone except sender)
    socket.broadcast.emit('new-passenger', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

