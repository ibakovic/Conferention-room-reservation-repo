'use strict';

var User = require('../models/models.js').User;
var message = require('../../strings.json');
var serverRouter = require('../lib/serverRoutes.js');
var bcrypt = require('bcryptjs');
var nodemailer = require('nodemailer');
var randomString = require('randomstring');
var format = require('string-template');
var moment = require('moment');
var logger = require('minilog')('user.js');

/**
 * @typedef ApiResponse
 * @param {String} msg       server message
 * @param {Boolean} success  status flag
 * @param {Object} data      server sent data
 */

/**
 * Gets current user's information
 * @param  {HttpRequest} req
 * @param  {HttpReply} res
 * @augments res using ApiResponse format
 */
function getUserInfo(req, res) {
  var resData = {};
  resData.success = false;

  var userOptions = {id: parseInt(req.auth.credentials, 10)};

  User.where(userOptions).fetch()
    .then(function getUserSuccess(user) {
      if(!user) {
        resData.msg = message.UserNotFound;
        res(resData).code(400);
        return;
      }

      resData.msg = message.UserFound;
      resData.success = true;
      resData.data = {
        username: user.get('username'),
        id: user.get('id'),
        firstName: user.get('firstName'),
        lastName: user.get('lastName'),
        email: user.get('email'),
        createdAt: user.get('createdAt'),
        password: ''
      };

      res(resData).code(200);
    })
    .catch(function getUserError(err) {
      resData = {};
      resData.success = false;
      resData.msg = err.message;

      res(resData).code(400);
    });
}

/**
 * Updates password
 * @param  {HttpRequest} req
 * @param  {HttpReply} res
 * @augments res using ApiResponse format
 */
function updatePassword(req, res) {
  var resData = {};
  resData.success = false;

  if(!req.payload.password) {
    resData.msg = message.PasswordNotFound;
    res(resData).code(400);
    return;
  }

  var userOptions = {
    id: parseInt(req.auth.credentials, 10),
    resetPasswordId: req.params.resetPasswordId
  };

  User.where(userOptions).fetch()
  .then(function updatePasswordFetchSuccess(user) {
    if(!user) {
      resData.msg = message.UserNotFound;
      res(resData).code(400);
      return;
    }

    var setPassword = {
      password: bcrypt.hashSync(req.payload.password, bcrypt.genSaltSync(10)),
      resetPasswordCreatedAt: null,
      resetPasswordId: null
    };

    user.save(setPassword, {method: 'update'})
    .then(function updatePasswordSuccess(updatedUser) {
      if(!user) {
        resData.msg = message.UserNotFound;
        res(resData).code(400);
        return;
      }

      resData.msg = message.PasswordUpdated;
      resData.success = true;

      res(resData).code(200);
    })
    .catch(function updatePasswordError(err) {
      resData = {};
      resData.msg = err.message;

      res(resData).code(400);
    });
  })
  .catch(function updatePasswordFetchError(err) {
    resData = {};
    resData.msg = err.message;

    res(resData).code(400);
  });
/*
  var setPassword = {password: bcrypt.hashSync(req.payload.password, bcrypt.genSaltSync(10))};

  User.where(userOptions).save(setPassword, {method: 'update'})
    .then(function updatePasswordSuccess(user) {
      if(!user) {
        resData.msg = message.UserNotFound;
        res(resData).code(400);
        return;
      }

      resData.msg = message.PasswordUpdated;
      resData.success = true;

      res(resData).code(200);
    })
    .catch(function updatePasswordError(err) {
      resData = {};
      resData.msg = err.message;

      res(resData).code(400);
    });*/
}

/**
 * Prepares password update, sends reset password e-mail
 * @param  {HttpRequest} req
 * @param  {HttpReply} res
 * @augments res using ApiResponse format
 */
function resetPasswordEmail(req, res) {
  var getUserQuery = {id: req.auth.credentials};
  var resData = {};
  resData.success = false;

  User.where(getUserQuery).fetch()
  .then(function resetPasswordEmailSuccess (user) {
    if (!user) {
      resData.msg = message.UserNotFound;
      res(resData).code(400);
      return;
    }

    var transporter = nodemailer.createTransport({
      host: 'mail.vip.hr'
    });

    var resetPasswordId = randomString.generate({charset: 'alphanumeric'});
    resetPasswordId = bcrypt.hashSync(resetPasswordId, bcrypt.genSaltSync(10));
    resetPasswordId = resetPasswordId.replace(/\//g,'*');
    resetPasswordId = resetPasswordId.replace(/\./g,'*');

    var url = format('{protocol}://{host}:{port}/#resetPassword/{id}', {
      protocol: req.server.info.protocol,
      host: req.info.hostname,
      port: req.server.info.port,
      id: resetPasswordId
    });

    var mailOptions = {
      from: 'noreply@extensionengine.com',
      to: user.get('email'),
      subject: message.EmailSubjectResetPassword,
      text: message.EmailTextResetPassword + url
    };

    transporter.sendMail(mailOptions, function userDeletedEmail(err, info) {
      if (err) {
        resData.msg = err;
        res(resData).code(400);
        return;
      }

      var now = moment()._d;

      var setParameters = {
        resetPasswordCreatedAt: now,
        resetPasswordId: resetPasswordId
      };

      User.where(getUserQuery).save(setParameters, {method: 'update'})
      .then(function resetPasswordEmailSentSuccess(updatedUser) {
        if(!updatedUser) {
          resData.msg = message.UserNotFound;
          res(resData).code(400);
          return;
        }

        resData.msg = message.EmailSentResetPassword;
        resData.success = true;
        resData.data = updatedUser;

        res(resData).code(200);
      })
      .catch(function resetPasswordEmailSentError(err) {
        resData = {};
        resData.msg = err.message;

        res(resData).code(400);
      });
    });
  })
  .catch(function resetPasswordEmailError(err) {
    resData = {};
    resData.msg = err.message;

    res(resData).code(400);
  });
}

var routeObjects = [{
  method: 'GET',
  path: '/user',
  handler: getUserInfo
}, {
  method: 'PUT',
  path: '/user/{resetPasswordId}',
  handler: updatePassword
}, {
  method: 'POST',
  path: '/resetMail',
  handler: resetPasswordEmail
}];

module.exports = function(server) {
  routeObjects.forEach(function(routeObject) {
    serverRouter(server, routeObject);
  });
}
