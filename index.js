//dependencies
const express = require('express');
const app = express();
const http = require('http');
const expressServer = http.createServer(app);
const mongoose = require('mongoose');

//internal imports
const Coordinates = require('./Coordinates');

//database connection
mongoose
   .connect('mongodb+srv://faiyaz:tncZi0cn9skkOnbJ@cluster0.peotm.mongodb.net/geoFencing?retryWrites=true&w=majority')
   .then(() => console.log(`app is successfully connected to database`))
   .catch((error) => console.log(error));

//initialise the io
const { Server } = require('socket.io');
const io = new Server(expressServer);

io.on('connection', (socket) => {
   Coordinates.watch([], { fullDocument: 'updateLookup' }).on('change', (change) => {
      socket.emit('coordsChange', change.fullDocument);
   });
});

app.get('/', (req, res, next) => {
   res.sendFile(__dirname + '/index.html');
});

expressServer.listen(5000, () => {
   console.log('App is alive on localhost:5000');
});
