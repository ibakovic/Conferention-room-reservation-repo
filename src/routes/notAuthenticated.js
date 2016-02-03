'use strict';

var bcrypt = require('bcryptjs');
var User = require('../models/models.js').User;
var uuid = 1;

function comparePasswords(password1, password2) {
  return bcrypt.compareSync(password1, password2);
}

function login(req, res) {
  var resData = {};
  resData.success = false;

  if (!req.payload.username || !req.payload.password) {
    resData.msg = 'Username and password required!';
    res(resData);
    return;
  }

  var loginQuery = {
    username: req.payload.username
  };

  User.where(loginQuery).fetch()
  .then(function userFound(user) {
    if (!user) {
      resData.msg = 'User not found!';

      res(resData);
      return;
    }

    if(!comparePasswords(req.payload.password, user.attributes.password)) {
      resData.msg = 'Invalid password!';
      res(resData);
      return;
    }

    var sid = String(++uuid);
    req.server.app.cache.set(sid, { account: user.attributes.id }, 0, function(err) {

      if (err) {
        res(err);
      }

      req.cookieAuth.set({ sid: sid });

      resData.msg = 'Login successfull!';
      resData.success = true;

      res(resData);
    });
  })
  .catch(function userNotFound(err) {
    resData.msg = 'User not found!';
    resData.err = err;

    res(resData);
    return;
  });
}

function register(req, res) {
  var resData = {};
  resData.success = false;
  
  if (!req.payload.username || !req.payload.password || !req.payload.firstName || !req.payload.lastName) {
    resData.msg = 'All fields must be non empty!';
    res(resData);
    return;
  }

  User.where({username: req.payload.username}).fetch()
  .then(function registerUser(user) {
    if (user) {
      resData.msg = 'Username already exists!';
      res(resData);
      return;
    }

    var newUser = new User({
      username: req.payload.username,
      password: bcrypt.hashSync(req.payload.password, bcrypt.genSaltSync(10)),
      firstName: req.payload.firstName,
      lastName: req.payload.lastName
    });

    newUser.save()
    .then(function userStored(storedUser) {
      resData.msg = 'Registration complete';
      resData.success = true;
      res(resData);
    });
  });
}

function logout(req, res) {
  req.cookieAuth.clear();
  res({
    msg: 'Logged out successfully!',
    success: true
  });
}

module.exports = function(server) {
  server.route({
    method: 'POST',
    path:'/login',
    config: {
      handler: login,
      auth: {
        mode: 'try',
        strategy: 'session'
      },
      plugins: {
        'hapi-auth-cookie': { redirectTo: false }
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/register',
    config: {
      handler: register,
      auth: {
        mode: 'try',
        strategy: 'session'
      },
      plugins: {
        'hapi-auth-cookie': { redirectTo: false }
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/logout',
    handler: logout
  });
};
