'use strict';

var request = {};
var Room = require('../models/models.js').Room;
var message = require('../../strings.json');

/**
 * @typedef ApiResponse
 * @param {String} msg       server message
 * @param {Boolean} success  status flag
 * @param {Object} data      server sent data
 */

/**
 * Gets all rooms
 * @param  {HttpRequest} req
 * @param  {HttpResponse} res
 * @augments res using ApiResponse format
 */
function listAllRooms(req, res) {
  var resData = {};
  resData.success = false;

  Room.fetchAll()
  .then(function fetchRooms(rooms) {
    if(!rooms) {
      resData.msg = message.RoomsNotFound;
      res(resData).code(400);
      return;
    }

    resData.msg = message.RoomsFound;
    resData.success = true;
    resData.data = rooms;

    res(resData).code(200);
  })
  .catch(function(err) {
    resData.msg = err.message;
    resData.err = err;

    res(resData).code(400);
  });
}

/**
 * Gets a single room
 * @param  {HttpRequest} req
 * @param  {HttpResponse} res
 * @augments res using ApiResponse format
 */
function getRoom(req, res) {
  var resData = {};
  resData.success = false;

  var roomQuery = {roomId: req.params.id};
  Room.where(roomQuery).fetch()
  .then(function gotMRoom(room) {
    if(!room) {
      resData.msg = message.RoomNotFound;
      res(resData).code(400);
      return;
    }
    resData.msg = message.RoomFound;
    resData.success = true;
    resData.data = room;

    res(resData).code(200);
  });
}

function setDuration(req, res) {
  var resData = {};
  resData.success = false;

  var roomQuery = {roomId: req.params.id};
  var setRoom = {maxDuration: parseInt(req.payload.maxDuration, 10)};

  Room.where(roomQuery).save(setRoom, {method: 'update'})
  .then(function updatingRoom(room) {
    if(!room) {
      resData.msg = message.RoomNotFound;
      res(resData).code(400);
      return;
    }

    resData.msg = 'Maximum duration updated!';
    resData.success = true;
    resData.data = room;

    res(resData).code(200);
  })
  .catch(function(err) {
    resData.msg = err.message;
    res(resData).code(400);
  });
}

var objects = [{
  method: 'GET',
  path: '/rooms',
  handler: listAllRooms
}, {
  method: 'GET',
  path: '/rooms/{id}',
  handler: getRoom
}, {
  method: 'POST',
  path: '/rooms/{id}',
  handler: setDuration
}];

module.exports = function roomsRouter(server) {
  server.route(objects);
};
