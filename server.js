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
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

let passengers = {};
let drivers = {}; // store drivers for live update

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Passenger sends location
  socket.on('passenger-location', (data) => {
    passengers[socket.id] = data;
    io.emit('passengers:update', Object.values(passengers));
  });

  // Driver sends location (optional, simulate driver movement)
  socket.on('driver-location', (data) => {
    drivers[socket.id] = data;
    io.emit('drivers:update', Object.values(drivers));
  });

  socket.on('disconnect', () => {
    delete passengers[socket.id];
    delete drivers[socket.id];
    io.emit('passengers:update', Object.values(passengers));
    io.emit('drivers:update', Object.values(drivers));
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
