'use strict';

var server = require('./src/lib/initializeServer.js');
var nunjucs = require('nunjucks');
var moment = require('moment');
var User = require('./src/models/models.js').User;

setInterval(function() {
  User.fetchAll()
  .then(function(users) {
    var now = moment()._d;
    console.log('Now:', now);

    users.models.forEach(function(user) {
      if(user.attributes.expiration) {
        var timeDifference = moment(now).diff(user.attributes.expiration, 'minutes');
        if(timeDifference > 0) {
          user.destroy();
          console.log('Row deleted!');
        }
      }
    });
  })
  .catch(function(err) {
    console.log(err);
  });
}, 15*60*1000);

//All dependecies
require('./src/lib/serverRegisters.js')(server);

//Rooms routes
require('./src/routes/rooms.js')(server);

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
