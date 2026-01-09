// server.js

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();

// Enable CORS so client apps can connect from anywhere
app.use(cors());
app.use(express.json());

// Root route for testing
app.get('/', (req, res) => {
  res.send('BANLIC server is running!');
});

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', // allow any client
    methods: ['GET', 'POST'],
  },
});

// Store passengers by socket ID
let passengers = {};

// Socket.IO events
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Passenger sends their location
  socket.on('passenger-location', (data) => {
    passengers[socket.id] = data;
    console.log('Passenger location:', data);

    // Emit updated passengers to all drivers
    io.emit('passengers-update', Object.values(passengers));
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    delete passengers[socket.id];

    // Emit updated passengers after disconnect
    io.emit('passengers-update', Object.values(passengers));
  });
});

// Use Railway PORT or fallback to 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
