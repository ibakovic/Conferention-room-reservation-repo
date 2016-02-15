'use strict';

var _ = require('lodash');
var User = require('../models/models.js').User;
var Room = require('../models/models.js').Room;
var Reservation = require('../models/models.js').Reservation;
var moment = require('moment');
var success;
var message = require('../../strings.json');
var serverRouter = require('../lib/serverRoutes.js');

function getAllReservations(req, res) {
	var resData = {};
	resData.success = false;

	Reservation.fetchAll()
	.then(function gotAllReservations(reservations) {
		if(!reservations) {
			resData.msg = message.ReservationsNotFound;
			res(resData).code(400);
			return;
		}
/*
		var start = moment(reservations.models[0].attributes.start).utc();
		var local = start.local();
		console.log('Local local', local);
		console.log('Local start', start);
		console.log('DB start', reservations.models[0].attributes.start);
*/
		resData.msg = message.ReservationsFound;
		resData.success = true;
		resData.data = reservations;

		res(resData).code(200);
	})
	.catch(function setError(err) {
		resData = {};
		resData.success = false;
		resData.msg = err.message;

		res(resData).code(400);
	});
}

function getRoomReservations(req, res) {
	var getReservations = {roomId: req.params.roomId};
	var resData = {};
	resData.success = false;

	Reservation.where(getReservations).fetchAll()
	.then(function gotRoomReservations(reservations) {
		if(!reservations) {
			resData.msg = message.ReservationsNotFound;
			res(resData).code(400);
			return;
		}

		resData.msg = message.ReservationsFound;
		resData.success = true;
		resData.data = reservations;

		res(resData).code(200);
	})
	.catch(function setError(err) {
		resData = {};
		resData.success = false;
		resData.msg = err;

		res(resData).code(400);
	});
}

function createReservation(req, res) {
	var makeReservation = {
		userId: parseInt(req.auth.credentials, 10),
		roomId: req.payload.roomId,
		title: req.payload.title,
		start: req.payload.start,
		end: req.payload.end
	};

	var resData = {};
	resData.success = false;

	if(!req.payload.title) {
		resData.msg = message.TitleNotFound;
		res(resData).code(400);
		return;
	}

	if(!req.payload.roomId) {
		resData.msg = message.RoomIdNotFound;
		res(resData).code(400);
		return;
	}

	if(!req.payload.start) {
		resData.msg = message.StartNotFound;
		res(resData).code(400);
		return;
	}

	if(!req.payload.end) {
		resData.msg = message.EndNotFound;
		res(resData).code(400);
		return;
	}

	var duration = moment(req.payload.end).diff(req.payload.start, 'minutes');
	if(duration > 180) {
		resData.msg = message.MaxDurationExceeded;
		res(resData).code(400);
		return;
	}

	if(duration <= 0) {
		resData.msg = message.EndBeforeStart;
		res(resData).code(400);
		return;
	}
	
	Reservation.fetchAll()
	.then(function overlapValidationAdd(reservations) {
		var success = true;
		_.map(reservations.models, function(reservation) {
			if(parseInt(req.payload.roomId, 10) === reservation.attributes.roomId) {
				if(moment(req.payload.start).diff(reservation.attributes.end, 'minutes') < 0) {
					if(moment(req.payload.end).diff(reservation.attributes.start, 'minutes') > 0) {
						success = false;
					}
				}
			}
		});

		if(!success) {
			resData.msg = message.Overlap;
			res(resData).code(400);
			return;
		}

		var reservation = new Reservation(makeReservation);

		reservation.save()
		.then(function reservationCreated(reservation) {
			if(!reservation) {
				resData.msg = message.ReservationNotSaved;
				res(resData).code(400);
				return;
			}

			resData.msg = message.ReservationSaved;
			resData.success = true;
			resData.data = reservation;

			res(resData).code(200);
		})
		.catch(function setError(err) {
			resData = {};
			resData.success = false;
			resData.msg = err;

			res(resData).code(400);
		});
	});
}

function changeDuration(req, response) {
	var resData = {};
	resData.success = false;

	if(!req.payload.start) {
		resData.msg = message.StartNotFound;
		response(resData).code(400);
		return;
	}

	if(!req.payload.end) {
		resData.msg = message.EndNotFound;
		response(resData).code(400);
		return;
	}

	var duration = moment(req.payload.end).diff(req.payload.start, 'minutes');
	if(duration > 181) {
		resData.msg = message.MaxDurationExceeded;
		response(resData).code(400);
		return;
	}

	if(duration <= 0) {
		resData.msg = message.EndBeforeStart;
		response(resData).code(400);
		return;
	}
	
	Reservation.fetchAll()
	.then(function overlapValidateChange(reservations) {
		var success = true;
		_.map(reservations.models, function(reservation) {
			if(parseInt(req.params.roomId, 10) === reservation.attributes.roomId) {
				if(reservation.attributes.id !== parseInt(req.params.id, 10)) {
					if(moment(req.payload.start).diff(reservation.attributes.end, 'minutes') < 0) {
						if(moment(req.payload.end).diff(reservation.attributes.start, 'minutes') > 0) {
							success = false;
						}
					}
				}
			}
		});

		if(!success) {
			resData.msg = message.Overlap;
			response(resData).code(400);
			return;
		}

		User.where({id: req.auth.credentials}).fetch()
		.then(function userChecked(user) {
			if(!user) {
				resData.msg = message.UserNotFound;
				response(resData).code(400);
				return;
			}

			var getReservation = {
				id: parseInt(req.params.id, 10),
				userId: parseInt(req.auth.credentials, 10)
			};

			if(user.attributes.username === 'admin') {
				getReservation = {id: parseInt(req.params.id, 10)};
			}

			var setReservation = {
				start: req.payload.start,
				end: req.payload.end
			};

			Reservation.where(getReservation).save(setReservation, {method: 'update'})
			.then(function reservationSet(res) {
				if(!res) {
					resData.msg = message.ReservationNotFound;
					response(resData).code(400);
					return;
				}
				
				resData.msg = message.ReservationUpdated;
				resData.success = true;
				resData.data = res;

				response(resData).code(200);
				return;
			})
			.catch(function setError(err) {
				resData = {};
				resData.success = false;
				resData.msg = err.message;

				response(resData).code(400);
			});
		})
		.catch(function(err) {
			resData = {};
			resData.success = false;
			resData.msg = err.message;

			response(resData).code(400);
		});
	});
}

function deleteReservation(req, res) {
	var resData = {};
	resData.success = false;

	var getReservation = {
		id: parseInt(req.params.id, 10),
		userId: parseInt(req.auth.credentials, 10)
	};

	Reservation.where(getReservation).fetch()
	.then(function(response) {
		if(!response) {
			resData.msg = message.ReservationNotFound;
			res(resData).code(400);
			return;
		}

		response.destroy()
		.then(function reservationDestroyed() {
			resData.msg = message.ReservationDeleted;
			resData.success = true;

			res(resData).code(200);
		})
		.error(function(err) {
			resData.msg = err.message;
			res(resData).code(400);
		});
	})
	.catch(function(err){
		resData.msg = err.message;
		res(resData).code(400);
	});
}

function updateTitle(req, response) {
	var resData = {};
	resData.success = false;

	if(!req.payload.newTitle) {
		resData.msg = message.TitleNotFound;

		response(resData).code(400);
		return;
	}

	var getReservation = {
		id: req.params.id,
		userId: req.auth.credentials
	};

	var setReservation = {
		title: req.payload.newTitle
	};

	Reservation.where(getReservation).save(setReservation, {method: 'update'})
	.then(function reservationSet(res) {
		if(!res) {
			resData.msg = message.ReservationNotFound;
			response(resData).code(400);
			return;
		}

		resData.msg = message.ReservationUpdated;
		resData.success = true;
		resData.data = res;

		response(resData).code(200);
		return;
	})
	.catch(function setError(err) {
		resData = {};
		resData.success = false;
		resData.msg = err.message;

		response(resData).code(400);
	});
}

//getSingleReservation.method = 'GET';
function getSingleReservation(req, res) {
	var resData = {};
	resData.success = false;

	Reservation.where({id: req.params.id}).fetch()
	.then(function gotAllReservations(reservations) {
		if(!reservations) {
			resData.msg = message.ReservationNotFound;
			res(resData).code(400);
			return;
		}

		resData.msg = message.ReservationFound;
		resData.success = true;
		resData.data = reservations;

		res(resData).code(200);
	})
	.catch(function setError(err) {
		resData = {};
		resData.success = false;
		resData.msg = err;

		res(resData).code(400);
	});
}

var objects = [{
	method: 'GET',
	path: '/reservations',
	handler: getAllReservations
}, {
	method: 'GET',
	path: '/reservations/rooms/{roomId}',
	handler: getRoomReservations
}, {
	method: 'PUT',
	path: '/reservations/{id}',
	handler: updateTitle
}, {
	method: 'POST',
	path: '/reservations/{id}',
	handler: changeDuration
}, {
	method: 'DELETE',
	path: '/reservations/{id}',
	handler: deleteReservation
}, {
	method: 'POST',
	path: '/reservations',
	handler: createReservation
}, {
	method: 'GET',
	path: '/reservations/{id}',
	handler: getSingleReservation
}];

module.exports = function(server) {
	objects.forEach(function(object) {
		serverRouter(server, object);
	});
	/*serverRouter(server, 'GET', '/reservations', getAllReservations);
	
	serverRouter(server, 'GET', '/reservations/rooms/{roomId}', getRoomReservations);
	
	serverRouter(server, 'PUT', '/reservations/{id}', updateTitle);
	
	serverRouter(server, 'POST', '/reservations/{id}', changeDuration);

	serverRouter(server, 'DELETE', '/reservations/{id}', deleteReservation);
	
	serverRouter(server, 'POST', '/reservations', createReservation);
	
	serverRouter(server, 'GET', '/reservations/{id}', getSingleReservation);*/
};
