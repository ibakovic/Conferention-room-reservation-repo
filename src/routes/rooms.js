'use strict';

var request = {};
var Room = require('../models/models.js').Room;

function listAllRooms(req, res) {
	var resData = {};
	resData.success = false;

	Room.fetchAll()
	.then(function fetchRooms(rooms) {
		resData.msg = 'List of rooms';
		resData.success = true;
		resData.data = rooms;

		res(resData);
	})
	.catch(function(err) {
		resData.msg = 'Error with data fetch';
		resData.err = err;

		res(resData);
	});
}

function createRoom(req, res) {
	var room = new Room({roomName: req.payload.roomName});

	var resData = {};
	resData.success = false;

	room.save()
	.then(function saveRoom(room) {
		if(!room) {
			resData.msg = 'Room not found';
			res(resData);
			return;
		}
		resData.msg = 'room created';
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
			resData.msg = 'Room not found';
			res(resData);
			return;
		}
		resData.msg = 'room found';
		resData.success = true;
		resData.data = room;

		res(resData);
	});
}

request.listAllRooms = {
	method: 'GET',
	path: '/rooms',
	handler: listAllRooms
};

request.createRoom = {
	method: 'POST',
	path: '/rooms',
	handler: createRoom
};

request.getRoom = {
	method: 'GET',
	path: '/rooms/{id}',
	handler: getRoom
};

module.exports = request;
