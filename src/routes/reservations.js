'use strict';

var User = require('../models/models.js').User;
var Room = require('../models/models.js').Room;
var Reservation = require('../models/models.js').Reservation;

function getRoomReservations(req, res) {
	var getReservations = {roomId: req.params.roomId};
	var resData = {};
	resData.success = false;

	Reservation.where(getReservations).fetchAll()
	.then(function gotRoomReservations(reservations) {
		if(!reservations) {
			resData.msg = 'No reservations found';
			res(resData);
			return;
		}

		resData.msg = 'Reservations found!';
		resData.success = true;
		resData.data = reservations;

		res(resData);
	})
	.catch(function setError(err) {
		resData = {};
		resData.success = false;
		resData.msg = err;

		res(resData);
	});
}

function createReservation(req, res) {
	var makeReservation = {
		userId: req.params.userId,
		roomId: req.params.roomId,
		title: req.payload.title,
		start: req.payload.start,
		end: req.payload.end
	};

	var resData = {};
	resData.success = false;

	var reservation = new Reservation(makeReservation);

	reservation.save()
	.then(function reservationCreated(reservation) {
		if(!reservation) {
			resData.msg = 'Failed to save reservation!';
			res(resData);
			return;
		}

		resData.msg = 'Reservation saved!';
		resData.success = true;
		resData.data = reservation;

		res(resData);
	})
	.catch(function setError(err) {
		resData = {};
		resData.success = false;
		resData.msg = err;

		res(resData);
	});
}

function changeDuration(req, response) {
	var resData = {};
	resData.success = false;

	var getReservation = {idReservations: req.params.reservationId};
	var setReservation = {
		start: req.payload.start,
		end: req.payload.end
	};

	Reservation.where(getReservation).save(setReservation, {method: 'update'})
	.then(function reservationSet(res) {
		if(!res) {
			resData.msg = 'Reservation not found!';
			response(resData);
			return;
		}

		resData.msg = 'Reservation updated!';
		resData.success = true;
		resData.data = res;
		console.log(resData);

		response(resData);
		return;
	})
	.catch(function setError(err) {
		resData = {};
		resData.success = false;
		resData.msg = err;

		response(resData);
	});
}

module.exports = function(server) {
	server.route({
		method: 'GET',
		path: '/reservations/{roomId}',
		handler: getRoomReservations
	});

	server.route({
		method: 'PUT',
		path: '/reservations/{reservationId}',
		handler: changeDuration
	});

	server.route({
		method: 'POST',
		path: '/users/{userId}/rooms/{roomId}',
		handler: createReservation
	});
};
