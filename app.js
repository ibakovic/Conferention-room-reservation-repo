'use strict';

var server = require('./src/routes/initializeServer.js');
var got = require('got');
var Path = require('path');
var User = require('./src/models/models.js').User;
var nunjucs = require('nunjucks');
var sass = require('hapi-sass');

var options = {
    src: './app/src/style/style.sass',
    dest: './app/dist/style.css',
    force: true,
    debug: true,
    outputStyle: 'nested',
    sourceComments: true
};
 
server.register({
  register: sass,
  options: options
  },
  function (err) {
    if (err) {
      throw err;
    }
  }
);

User.fetchAll()
  .then(function(users) {
    server.route({
      method: 'GET',
      path: '/users',
      handler: function(req, res) {
        res(users);
      }
    });
  })
  .catch(function(err) {
    console.log(err);
  });

//Use default templating engine
server.register(require('vision'), function(err) {
	if (err) {
    throw err;
  }

  server.views({
    engines: {
      html: require('handlebars')
    }
  });
});

//Rooms routes
var roomsRouter = require('./src/routes/rooms.js');

server.route(roomsRouter.listAllRooms);
server.route(roomsRouter.createRoom);
server.route(roomsRouter.getRoom);

//Reservations routes no time check
require('./src/routes/reservations.js')(server);

//Login and register
//require('./src/routes/notAuthenticated.js')(server);

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
      }/*,
      auth: {
        mode: 'try',
        strategy: 'session'
      },
      plugins: {
        'hapi-auth-cookie': { redirectTo: false }
      }*/
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
