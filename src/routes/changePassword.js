'use strict';

var User = require('../models/models.js').User;
var message = require('../../strings.json');
var bcrypt = require('bcryptjs');
var nodemailer = require('nodemailer');
var randomString = require('randomstring');
var format = require('string-template');
var moment = require('moment');
var md5 = require('md5');
var logger = require('minilog')('changePassword.js');

/**
 * @typedef ApiResponse
 * @param {String} msg       server message
 * @param {Boolean} success  status flag
 * @param {Object} data      server sent data
 */

/**
 * Updates password
 * @param  {HttpRequest} req
 * @param  {HttpReply} res
 * @augments res using ApiResponse format
 */
function updatePassword(req, res) {
  var response = res;
  var resData = {};
  resData.success = false;

  if(!req.payload.password) {
    resData.msg = message.PasswordNotFound;
    res(resData).code(400);
    return;
  }

  var userOptions = {
    resetPasswordId: req.params.resetPasswordId
  };

  User.where(userOptions).fetch()
  .then(function updatePasswordFetchSuccess(user) {
    if(!user) {
      resData.msg = message.UserNotFound;
      res(resData).code(400);
      return;
    }

    var md5Request = user.get('username') + '/' + req.params.resetPasswordId;
    md5Request = md5(md5Request);

    if(md5Request !== req.params.md5) {
      resData.msg = message.PasswordResetCorrupted;
      resData.md5 = req.params.md5;
      resData.md5Request = md5Request;
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
      resData.data = response;

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
}

/**
 * Prepares password update, sends reset password e-mail
 * @param  {HttpRequest} req
 * @param  {HttpReply} res
 * @augments res using ApiResponse format
 */
function resetPasswordEmail(req, res) {
  var getUserQuery = {
    where: {username: req.payload.userStringId},
    orWhere: {email: req.payload.userStringId}
  };
  var resData = {};
  resData.success = false;

  if(!req.payload.userStringId) {
    resData.msg = message.userStringNotFound;
    res(resData).code(400);
    return;
  }

  User.query(getUserQuery)
  .fetch()
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

    var md5Content = user.get('username') + '/' + resetPasswordId;
    var md5Response = md5(md5Content);

    var url = format('{protocol}://{host}:{port}/#resetPassword/{id}/{md5}', {
      protocol: req.server.info.protocol,
      host: req.info.hostname,
      port: req.server.info.port,
      id: resetPasswordId,
      md5: md5Response
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

      User.query(getUserQuery).save(setParameters, {method: 'update'})
      .then(function resetPasswordEmailSentSuccess(updatedUser) {
        if(!updatedUser) {
          resData.msg = message.UserNotFound;
          res(resData).code(400);
          return;
        }

        resData.msg = message.EmailSentResetPassword;
        resData.success = true;
        resData.md5 = md5Response;

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

var objects = [{
  method: 'PUT',
  path: '/user/{resetPasswordId}/{md5}',
  config: {
    handler: updatePassword,
    auth: {
      mode: 'try',
      strategy: 'session'
    },
    plugins: {
      'hapi-auth-cookie': { redirectTo: false }
    }
  }
}, {
  method: 'POST',
  path: '/resetMail',
  config: {
    handler: resetPasswordEmail,
    auth: {
      mode: 'try',
      strategy: 'session'
    },
    plugins: {
      'hapi-auth-cookie': { redirectTo: false }
    }
  }
}];

module.exports = function(server) {
  server.route(objects);
}
