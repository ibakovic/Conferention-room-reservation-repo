var sass = require('hapi-sass');

var options = {
    src: '../../app/src/style/style.sass',
    dest: '../../app/dist/style.css',
    force: true,
    debug: true,
    outputStyle: 'nested',
    sourceComments: true
};

module.exports = function(server) {
  //Include sass as a stylesheet language
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

  //Authentication validatin and strategy
  server.register(require('hapi-auth-cookie'), function(err) {

    if (err) {
      throw err;
    }

    var cache = server.cache({ segment: 'sessions', expiresIn: 3 * 24 * 60 * 60 * 1000 });
    server.app.cache = cache;

    server.auth.strategy('session', 'cookie', true, {
      password: 'secret',
      cookie: 'conferenceRoomReservation',
      redirectTo: '/',
      isHttpOnly: false,
      isSecure: false,
      clearInvalid: true,
      validateFunc: function (request, session, callback) {

        cache.get(session.sid, function(err, cached) {
          if (err) {
            return callback(err, false);
          }

          if (!cached) {
            return callback(null, false);
          }

          return callback(null, true, cached.account);
        });
      }
    });
  });
};
