const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io').listen(server);

let players = {};

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res, next) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', socket => {
  console.log('A user ' + socket.id + ' connected.');
  // create a new player and add it to our players object
  players[socket.id] = {
    rotation: 0,
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50,
    playerId: socket.id,
    team: Math.floor(Math.random() * 2) == 0 ? 'red' : 'blue'
  };

  console.log(players[socket.id]);

  // send players object to new player
  socket.emit('currentPlayers', players);
  // send the new player data to all other players
  socket.broadcast.emit('newPlayer', players[socket.id]);

  socket.on('disconnect', () => {
    console.log('User ' + socket.id + ' disconnected.');
    // remove this player from players object
    delete players[socket.id];
    // emmit a message to all players to remove this player
    io.emit('disconnect', socket.id);
  });
});

server.listen(8081, () => {
  console.log(`Listening on ${server.address().port}`);
});
