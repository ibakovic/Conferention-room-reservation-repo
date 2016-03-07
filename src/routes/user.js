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

var routeObjects = [{
  method: 'GET',
  path: '/user',
  handler: getUserInfo
}];

module.exports = function(server) {
  routeObjects.forEach(function(routeObject) {
    serverRouter(server, routeObject);
  });
}
