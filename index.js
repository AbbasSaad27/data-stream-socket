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

//Process and update coordinates on the database. In this function we recieve the updated coords from frontend
const processUpdateCoords = async function (data) {
   const { id, coords: updatedCoords } = data;
   //query to database to update the coords
   await Coordinates.findOneAndUpdate(
      { _id: id },
      {
         $set: {
            location: {
               type: 'Point',
               coordinates: [...updatedCoords],
            },
         },
      }
   );
};

//open socket connection
io.on('connection', async (socket) => {
   //update the coords into the database by recieving sendsCoords event from frontend
   socket.on('updateCoords', processUpdateCoords);

   //track if there are any changes has made to databse if there is changes then return the changed data to frontend for better dev experience
   Coordinates.watch([], { fullDocument: 'updateLookup' }).on('change', (change) => {
      socket.emit('getUpdatedCoords', change.fullDocument);
   });
});

//load the html file to browser
app.get('/', (req, res, next) => {
   res.sendFile(__dirname + '/index.html');
});

//define the port
const PORT = process.env.PORT || 5000;

//start the server
expressServer.listen(PORT, () => {
   console.log(`App is alive on localhost:${PORT}`);
});
