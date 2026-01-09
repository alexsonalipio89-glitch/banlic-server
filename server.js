// server.js

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('BANLIC server is running!');
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// ===============================
// IN-MEMORY STORAGE
// ===============================
let passengers = {}; // socket.id -> { lat, lng }
let drivers = {};    // socket.id -> { lat, lng }

// ===============================
// SOCKET.IO
// ===============================
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // ===============================
  // PASAHERO LOCATION
  // ===============================
  socket.on('pasahero:location', (data) => {
    passengers[socket.id] = data;

    io.emit('pasahero:update', {
      id: socket.id,
      lat: data.lat,
      lng: data.lng,
    });

    io.emit('drivers:update', Object.values(drivers));
  });

  // ===============================
  // DRIVER LOCATION
  // ===============================
  socket.on('driver:location', (data) => {
    drivers[socket.id] = data;

    io.emit('driver:update', {
      id: socket.id,
      lat: data.lat,
      lng: data.lng,
    });

    io.emit('passengers:update', Object.values(passengers));
  });

  // ===============================
  // DISCONNECT
  // ===============================
  socket.on('disconnect', () => {
    console.log('Disconnected:', socket.id);

    delete passengers[socket.id];
    delete drivers[socket.id];

    io.emit('passengers:update', Object.values(passengers));
    io.emit('drivers:update', Object.values(drivers));
  });
});

// ===============================
// START SERVER
// ===============================
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
