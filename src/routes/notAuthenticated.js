'use strict';

var bcrypt = require('bcryptjs');
var User = require('../models/models.js').User;
var Temp = require('../models/models.js').Temp;
var message = require('../../strings.json');
var moment = require('moment');
var isEmail = require('is-email');
var nodemailer = require('nodemailer');
var format = require('string-template');
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
  //console.log(req.server.info);
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

  if(!isEmail(req.payload.email)) {
    resData.msg = message.EmailWrongFormat;
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

    Temp.fetchAll()
    .then(function tempsFetched(temps) {
      var tempUsernameExists = false;
      var tempEmailExists = false;

      temps.models.forEach(function(model) {
        if(model.attributes.username === req.payload.username)
          tempUsernameExists = true;

        if(model.attributes.email === req.payload.email) {
          tempEmailExists = true;
        }
      });

      if(tempUsernameExists) {
        resData.msg = message.UsernameExists;
        res(resData);
        return;
      }

      if(tempEmailExists) {
        resData.msg = message.EmailExists;
        res(resData);
        return;
      }

      var confirmId = bcrypt.hashSync(req.payload.username, bcrypt.genSaltSync(10), null).toString();
      confirmId = confirmId.replace(/\//g,'*');

      var expiration = moment().add(1.5, 'h')._d;
      
      var newTemp = new Temp({
        username: req.payload.username,
        password: bcrypt.hashSync(req.payload.password, bcrypt.genSaltSync(10)),
        firstName: req.payload.firstName,
        lastName: req.payload.lastName,
        email: req.payload.email,
        expiration: expiration,
        confirmId: confirmId
      });

      newTemp.save()
      .then(function tempSaved(savedTemp) {
        if(!savedTemp) {
          resData.msg = message.RegistrationFailed;
          res(resData);
          return;
        }

        var url = format('{protocol}://{host}:{port}/#confirm/{id}', {
          protocol: req.server.info.protocol,
          host: req.server.info.address,
          port: req.server.info.port,
          id: confirmId
        });

        var transporter = nodemailer.createTransport({
          host: 'mail.vip.hr'
        });

        var mailOptions = {
          from: 'noreply@extensionengine.com',
          to: req.payload.email,
          subject: message.EmailSubject,
          text: message.EmailText + url
        };

        transporter.sendMail(mailOptions, function(err, info) {
          if(err) {
            console.log(err);
            return res.status(400).json({msg: message.EmailNotSent});
          }
          
          resData.msg = message.RegistrationCompleted;
          resData.success = true;
          res(resData);
        });
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
  })
  .catch(function(err) {
    resData.msg = err.message;
    res(resData);
  });
}

function confirmRegistration(req, res) {
  var resData = {};
  resData.success = false;

  if(!req.params.confirmId) {
    resData.msg = message.ConfirmIdNotFound;
    res(resData);
    return;
  }

  Temp.where({confirmId: req.params.confirmId}).fetch()
  .then(function confirmationFetched(confirmation) {
    if(!confirmation) {
      resData.msg = message.ConfirmationNotFound;
      res(resData);
      return;
    }

    var userAttributes = {
      username: confirmation.attributes.username,
      password: confirmation.attributes.password,
      firstName: confirmation.attributes.firstName,
      lastName: confirmation.attributes.lastName,
      email: confirmation.attributes.email
    };

    confirmation.destroy()
    .then(function confirmationDestroyed() {
      var newUser = new User(userAttributes);

      newUser.save()
      .then(function userSaved(user) {
        if(!user) {
          resData.msg = message.UserNotSaved;
          res(resData);
          return;
        }

        resData.success = true;
        resData.msg = message.UserSaved;
        resData.data = user;
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
  })
  .catch(function(err) {
    resData.msg = err.message;
    res(resData);
  });
}

function logout(req, res) {
  req.cookieAuth.clear();
  res({
    msg: 'Logged out successfully!',
    success: true
  });
}

function routes(server, method, path, handler) {
  return server.route({
    method: method,
    path: path,
    config: {
      handler: handler,
      auth: {
        mode: 'try',
        strategy: 'session'
      },
      plugins: {
        'hapi-auth-cookie': { redirectTo: false }
      }
    }
  });
}

module.exports = function(server) {
  routes(server, 'POST', '/login', login);
  routes(server, 'POST', '/register', register);
  routes(server, 'GET', '/confirm/{confirmId}', confirmRegistration);

  server.route({
    method: 'GET',
    path: '/logout',
    handler: logout
  });
};
