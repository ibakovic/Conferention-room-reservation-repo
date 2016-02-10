'use strict';

var request = {};
var Room = require('../models/models.js').Room;
var serverRoute = require('../lib/serverRoutes.js');
var message = require('../../strings.json');

function listAllRooms(req, res) {
	var resData = {};
	resData.success = false;

	Room.fetchAll()
	.then(function fetchRooms(rooms) {
		if(!rooms) {
			resData.msg = message.RoomsNotFound;
		}

		resData.msg = message.RoomsFound;
		resData.success = true;
		resData.data = rooms;

		res(resData);
	})
	.catch(function(err) {
		resData.msg = err.message;
		resData.err = err;

		res(resData);
	});
}

function createRoom(req, res) {
	var resData = {};
	resData.success = false;

	if(!req.payload.roomName) {
		resData.msg = message.RoomNameNotFound;
		res(resData);
		return;
	}

	var room = new Room({roomName: req.payload.roomName});

	room.save()
	.then(function saveRoom(room) {
		if(!room) {
			resData.msg = message.RoomNotFound;
			res(resData);
			return;
		}
		resData.msg = message.RoomCreated;
		resData.success = true;
		resData.data = room;

		res(resData);
	});
}

function getRoom(req, res) {	
	var resData = {};
	resData.success = false;

	var roomQuery = {roomId: req.params.id};
	Room.where(roomQuery).fetch()
	.then(function gotMRoom(room) {
		if(!room) {
			resData.msg = message.RoomNotFound;
			res(resData);
			return;
		}
		resData.msg = message.RoomFound;
		resData.success = true;
		resData.data = room;

		res(resData);
	});
}

module.exports = function roomsRouter(server) {
	serverRoute(server, 'GET', '/rooms', listAllRooms);
	
	serverRoute(server, 'POST', '/rooms', createRoom);
	
	serverRoute(server, 'GET', '/rooms/{id}', getRoom);
};
