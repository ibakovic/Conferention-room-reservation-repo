'use strict';

var bcrypt = require('bcryptjs');
var User = require('../models/models.js').User;
var message = require('../../strings.json');
var moment = require('moment');
var uuid = 1;

function comparePasswords(password1, password2) {
  return bcrypt.compareSync(password1, password2);
}

function login(req, res) {
  var resData = {};
  resData.success = false;

  if (!req.payload.username || !req.payload.password) {
    resData.msg = message.CredentialsRequired;
    res(resData);
    return;
  }

  var loginQuery = {
    username: req.payload.username
  };

  User.where(loginQuery).fetch()
  .then(function userFound(user) {
    if (!user) {
      resData.msg = message.UserNotFound;

      res(resData);
      return;
    }

    if(!comparePasswords(req.payload.password, user.attributes.password)) {
      resData.msg = message.PasswordInvalid;
      res(resData);
      return;
    }

    var sid = String(++uuid);
    req.server.app.cache.set(sid, { account: user.attributes.id }, 0, function(err) {

      if (err) {
        res(err);
      }

      req.cookieAuth.set({ sid: sid });

      resData.msg = message.LoginSuccess;
      resData.success = true;

      res(resData);
    });
  })
  .catch(function userNotFound(err) {
    resData.msg = message.UserNotFound;
    resData.err = err;

    res(resData);
    return;
  });
}

function register(req, res) {
  var resData = {};
  resData.success = false;
  
  if (!req.payload.username || !req.payload.password) {
    resData.msg = message.CredentialsRequired;
    res(resData);
    return;
  }

  if(!req.payload.firstName || !req.payload.lastName) {
    resData.msg = message.FirstLastNameNotFound;
    res(resData);
    return;
  }

  if(!req.payload.email) {
    resData.msg = message.EmailNotFound;
    res(resData);
    return;
  }

  User.fetchAll()
  .then(function tempUserFound(users) {
    var usernameExists = false;
    var emailExists = false;

    users.models.forEach(function(model) {
      if(model.attributes.username === req.payload.username)
        usernameExists = true;

      if(model.attributes.email === req.payload.email) {
        emailExists = true;
      }
    });

    if(usernameExists) {
      resData.msg = message.UsernameExists;
      res(resData);
      return;
    }

    if(emailExists) {
      resData.msg = message.EmailExists;
      res(resData);
      return;
    }

    var expiration = moment().add(1.5, 'h')._d;
    
    var newTemp = new User({
      username: req.payload.username,
      password: bcrypt.hashSync(req.payload.password, bcrypt.genSaltSync(10)),
      firstName: req.payload.firstName,
      lastName: req.payload.lastName,
      email: req.payload.email,
      expiration: expiration
    });

    newTemp.save()
    .then(function tempSaved(savedTemp) {
      if(!savedTemp) {
        resData.msg = message.RegistrationFailed;
        res(resData);
        return;
      }

      resData.msg = message.RegistrationCompleted;
      resData.success = true;
      res(resData);
    })
    .catch(function(err) {
      resData.msg = err.message;
      res(resData);
    });
  })
  .catch(function(err) {
    resData.msg = err.message;
    res(resData);
  });
////////////////////////////////////////////////////////////////////////////
  /*User.where({username: req.payload.username}).fetch()
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
    });*/
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






/*
function register(req, res) {
  var resData = {};
  resData.success = false;
  
  if (!req.payload.username || !req.payload.password) {
    resData.msg = message.CredentialsRequired;
    res(resData);
    return;
  }

  if(!req.payload.firstName || !req.payload.lastName) {
    resData.msg = message.FirstLastNameNotFound;
    res(resData);
    return;
  }

  if(!req.payload.email) {
    resData.msg = message.EmailNotFound;
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
 */