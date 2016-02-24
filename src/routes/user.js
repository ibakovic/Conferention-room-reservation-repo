'use strict';

var User = require('../models/models.js').User;
var message = require('../../strings.json');
var serverRouter = require('../lib/serverRoutes.js');
var bcrypt = require('bcryptjs');
var nodemailer = require('nodemailer');

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


//mozda hashirat vise podataka, a ne samo id
function updatePassword(req, res) {
  var resData = {};
  resData.success = false;

  var idHash = bcrypt.hashSync(req.auth.credentials, bcrypt.genSaltSync(10));

  if(idHash !== req.params.userHash) {
    resData.msg = message.NotAuthrized;
    res(resData).code(400);
    return;
  }

  if(!req.payload.password) {
    resData.msg = message.PasswordNotFound;
    res(resData).code(400);
    return;
  }

  var userOptions = {id: parseInt(req.auth.credentials, 10)};

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
      resData.success = false;
      resData.msg = err.message;

      res(resData).code(400);
    });
}

/*
payload needed:
  - userId: cookie
  - email

resetPasswordHash:
  - timeout
  - delete when completed
  - no duplicates
 */
function resetPasswordEmail(req, res) {}

var routeObjects = [{
  method: 'GET',
  path: '/user',
  handler: getUserInfo
}, {
  method: 'PUT',
  path: '/user/{userHash}',
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
