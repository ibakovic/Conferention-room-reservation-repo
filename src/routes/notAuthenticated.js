'use strict';

var bcrypt = require('bcryptjs');
var User = require('../models/models.js').User;
var message = require('../../strings.json');
var moment = require('moment');
var isEmail = require('is-email');
var nodemailer = require('nodemailer');
var format = require('string-template');
var uuid = 1;

/**
 * Hashes second password and then compares with the hash in database
 * @param  {Hash} password1
 * @param  {Hash} password2
 * @return {Bool} True if passwords match, false otherwise
 */
function comparePasswords(password1, password2) {
  return bcrypt.compareSync(password1, password2);
}

/**
 * @typedef ApiResponse
 * @param {String} msg       server message
 * @param {Boolean} success  status flag
 * @param {Object} data      server sent data
 */

/**
 * Logs in user with proper username and password and creates and sends a cookie
 * @param  {HttpRequest} req
 * @param  {HttpReply} res
 * @augments res using ApiResponse format
 */
function login(req, res) {
  var resData = {};
  resData.success = false;

  if (!req.payload.username || !req.payload.password) {
    resData.msg = message.CredentialsRequired;
    res(resData).code(400);
    return;
  }

  var loginQuery = {
    username: req.payload.username,
    verificationId: null
  };

  User.where(loginQuery).fetch()
  .then(function userFound(user) {
    if (!user) {
      resData.msg = message.UserNotFound;

      res(resData).code(400);
      return;
    }

    if(!comparePasswords(req.payload.password, user.attributes.password)) {
      resData.msg = message.PasswordInvalid;
      res(resData).code(400);
      return;
    }

    var sid = String(++uuid);
    req.server.app.cache.set(sid, { account: user.attributes.id }, 0, function(err) {

      if (err) {
        res(err).code(400);
        return;
      }

      req.cookieAuth.set({ sid: sid });

      resData.msg = message.LoginSuccess;
      resData.success = true;

      res(resData).code(200);
    });
  })
  .catch(function userNotFound(err) {
    resData.msg = message.UserNotFound;
    resData.err = err;

    res(resData).code(400);
    return;
  });
}

/**
 * Registers user if given e-mail and username don't exist
 * @param  {HttpRequest} req
 * @param  {HttpReply} res
 * @augments res using ApiResponse format
 */
function register(req, res) {
  var resData = {};
  resData.success = false;
  
  if (!req.payload.username || !req.payload.password) {
    resData.msg = message.CredentialsRequired;
    res(resData).code(400);
    return;
  }

  if(!req.payload.firstName || !req.payload.lastName) {
    resData.msg = message.FirstLastNameNotFound;
    res(resData).code(400);
    return;
  }

  if(!req.payload.email) {
    resData.msg = message.EmailNotFound;
    res(resData).code(400);
    return;
  }

  if(!isEmail(req.payload.email)) {
    resData.msg = message.EmailWrongFormat;
    res(resData).code(400);
    return;
  }

  User.query({where: {username: req.payload.username}, orWhere: {email: req.payload.email}}).fetch()
  .then(function foundUsers(user) {
    if(!user) {
      var verificationId = bcrypt.hashSync(req.payload.username, bcrypt.genSaltSync(10), null).toString();
      verificationId = verificationId.replace(/\//g,'*');

      var createdAt = moment()._d;
      
      var newTemp = new User({
        username: req.payload.username,
        password: bcrypt.hashSync(req.payload.password, bcrypt.genSaltSync(10)),
        firstName: req.payload.firstName,
        lastName: req.payload.lastName,
        email: req.payload.email,
        createdAt: createdAt,
        verificationId: verificationId
      });

      newTemp.save()
      .then(function tempSaved(savedTemp) {
        if(!savedTemp) {
          resData.msg = message.RegistrationFailed;
          res(resData).code(400);
          return;
        }

        var url = format('{protocol}://{host}:{port}/#confirm/{id}', {
          protocol: req.server.info.protocol,
          host: req.server.info.address,
          port: req.server.info.port,
          id: verificationId
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
            resData.msg = message.EmailNotSent;
            res(resData).code(400);
            return;
          }
          
          resData.msg = message.RegistrationCompleted;
          resData.success = true;
          res(resData).code(200);
        });
      })
      .catch(function(err) {
        resData.msg = err.message;
        res(resData).code(400);
      });
      return;
    }

    if(user.get('username') === req.payload.username) {
      resData.msg = message.UsernameExists;
      res(resData).code(400);
      return;
    }

    if(user.get('email') === req.payload.email) {
      resData.msg = message.EmailExists;
      res(resData).code(400);
    }
  })
  .catch(function(err) {
    resData.msg = err.message;
    res(resData).code(400);
  });
}

/**
 * Confirmes registration so user can log in
 * @param  {HttpRequest} req
 * @param  {HttpReply} res
 * @augments res using ApiResponse format
 */
function confirmRegistration(req, res) {
  var resData = {};
  resData.success = false;

  if(!req.params.confirmId) {
    resData.msg = message.ConfirmIdNotFound;
    res(resData).code(400);
    return;
  }

  User.where({verificationId: req.params.confirmId}).fetch()
  .then(function confirmationFetched(confirmation) {
    if(!confirmation) {
      resData.msg = message.ConfirmationNotFound;
      res(resData).code(400);
      return;
    }

    var setVerificationId = {verificationId: null};
    confirmation.save(setVerificationId, {method: 'update'})
    .then(function confirmationUpdated(confirmation) {
      if(!confirmation) {
        resData.msg = message.ConfirmationFailed;
        res(resData).code(400);
        return;
      }

      resData.success = true;
      resData.msg = message.UserSaved;
      resData.data = confirmation;
      res(resData).code(200);
    })
    .catch(function(err) {
      resData.msg = err.message;
      res(resData).code(400);
    });
  })
  .catch(function(err) {
    resData.msg = err.message;
    res(resData).code(400);
  });
}

/**
 * Erases cookies and returns to login page
 * @param  {HttpRequest} req
 * @param  {HttpReply} res
 */
function logout(req, res) {
  req.cookieAuth.clear();
  res({
    msg: 'Logged out successfully!',
    success: true
  }).code(200);
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
