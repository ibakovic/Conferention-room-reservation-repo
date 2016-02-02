'use strict';

var server = require('./src/lib/initializeServer.js');
var nunjucs = require('nunjucks');

//All dependecies
require('./src/lib/serverRegisters.js')(server);

//Rooms routes
var roomsRouter = require('./src/routes/rooms.js');

server.route(roomsRouter.listAllRooms);
server.route(roomsRouter.createRoom);
server.route(roomsRouter.getRoom);

//Reservations routes no time check
require('./src/routes/reservations.js')(server);

//Login and register
require('./src/routes/notAuthenticated.js')(server);

//Handle static data
server.register(require('inert'), function(err) {
  if (err) {
    throw err;
  }

  server.route({
    method: 'GET',
    path: '/{param*}',
    config: {
      handler: {
        directory: {
          path: '.',
          redirectToSlash: true,
          index: true
        }
      },
      auth: {
        mode: 'try',
        strategy: 'session'
      },
      plugins: {
        'hapi-auth-cookie': { redirectTo: false }
      }
    }
  });
});

//Start listening
server.start(function(err) {
  if (err) {
    throw err;
  }

  console.log('Server runing at:', server.info.uri);
});
