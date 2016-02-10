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
			res(resData);
			return;
		}

		resData.msg = message.ReservationsFound;
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

function getAllReservations2(req, res) {
	var resData = {};
	resData.success = false;

	Room.fetchAll()
	.then(function roomsFetched(rooms){
		Reservation.fetchAll()
		.then(function gotAllReservations(reservations) {
			if(!reservations) {
				resData.msg = message.ReservationsNotFound;
				res(resData);
				return;
			}
			var reservationMatrix = [];
			var i = 0;
			_.forEach(rooms.models, function(room) {
				reservationMatrix.push(_.filter(reservations.models, function(reservation) {
					if(reservation.attributes.roomId === room.attributes.roomId) 
						return reservation;
				}));
			});

			resData.msg = message.ReservationsFound;
			resData.success = true;
			resData.data = reservationMatrix;

			res(resData);
		})
		.catch(function setError(err) {
			resData = {};
			resData.success = false;
			resData.msg = err.message;

			res(resData);
		});
	})
	.catch(function (err) {
		resData.success = false;
		resData.msg = err.message;

		res(resData);
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
			res(resData);
			return;
		}

		resData.msg = message.ReservationsFound;
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
		userId: parseInt(req.auth.credentials, 10),
		roomId: req.params.roomId,
		title: req.payload.title,
		start: req.payload.start,
		end: req.payload.end
	};

	var resData = {};
	resData.success = false;

	if(!req.payload.title) {
		resData.msg = message.TitleNotFound;
		res(resData);
		return;
	}

	if(!req.payload.start) {
		resData.msg = message.StartNotFound;
		res(resData);
		return;
	}

	if(!req.payload.end) {
		resData.msg = message.EndNotFound;
		res(resData);
		return;
	}

	var duration = moment(req.payload.end).diff(req.payload.start, 'minutes');
	if(duration > 180) {
		resData.msg = message.MaxDurationExceeded;
		res(resData);
		return;
	}

	if(duration <= 0) {
		resData.msg = message.EndBeforeStart;
		res(resData);
		return;
	}
	
	Reservation.fetchAll()
	.then(function overlapValidationAdd(reservations) {
		var success = true;
		_.map(reservations.models, function(reservation) {
			if(parseInt(req.params.roomId, 10) === reservation.attributes.roomId) {
				if(moment(req.payload.start).diff(reservation.attributes.end, 'minutes') < 0) {
					if(moment(req.payload.end).diff(reservation.attributes.start, 'minutes') > 0) {
						success = false;
					}
				}
			}
		});

		if(!success) {
			resData.msg = message.Overlap;
			res(resData);
			return;
		}

		var reservation = new Reservation(makeReservation);

		reservation.save()
		.then(function reservationCreated(reservation) {
			if(!reservation) {
				resData.msg = message.ReservationNotSaved;
				res(resData);
				return;
			}

			resData.msg = message.ReservationSaved;
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
	});
}

function changeDuration(req, response) {
	var resData = {};
	resData.success = false;

	if(!req.payload.start) {
		resData.msg = message.StartNotFound;
		response(resData);
		return;
	}

	if(!req.payload.end) {
		resData.msg = message.EndNotFound;
		response(resData);
		return;
	}

	var duration = moment(req.payload.end).diff(req.payload.start, 'minutes');
	if(duration > 180) {
		resData.msg = message.MaxDurationExceeded;
		response(resData);
		return;
	}

	if(duration <= 0) {
		resData.msg = message.EndBeforeStart;
		response(resData);
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
			response(resData);
			return;
		}

		User.where({id: req.auth.credentials}).fetch()
		.then(function userChecked(user) {
			if(!user) {
				resData.msg = message.UserNotFound;
				response(resData);
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
					response(resData);
					return;
				}
				
				resData.msg = message.ReservationUpdated;
				resData.success = true;
				resData.data = res;

				response(resData);
				return;
			})
			.catch(function setError(err) {
				resData = {};
				resData.success = false;
				resData.msg = err.message;

				response(resData);
			});
		})
		.catch(function(err) {
			resData = {};
			resData.success = false;
			resData.msg = err.message;

			response(resData);
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

	Reservation.where(getReservation).destroy()
	.then(function(response) {
		resData.msg = message.ReservationDeleted;
		resData.success = true;

		res(resData);
	})
	.catch(function(err){
		resData.msg = err.message;
		res(resData);
	});
}

function updateTitle(req, response) {
	var resData = {};
	resData.success = false;

	if(!req.payload.newTitle) {
		resData.msg = message.TitleNotFound;

		response(resData);
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
			response(resData);
			return;
		}

		resData.msg = message.ReservationUpdated;
		resData.success = true;
		resData.data = res;

		response(resData);
		return;
	})
	.catch(function setError(err) {
		resData = {};
		resData.success = false;
		resData.msg = err.message;

		response(resData);
	});
}

function getSingleReservation(req, res) {
	var resData = {};
	resData.success = false;

	Reservation.where({id: req.params.id}).fetch()
	.then(function gotAllReservations(reservations) {
		if(!reservations) {
			resData.msg = message.ReservationNotFound;
			res(resData);
			return;
		}

		resData.msg = message.ReservationFound;
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

module.exports = function(server) {
	serverRouter(server, 'GET', '/reservations', getAllReservations);
	
	serverRouter(server, 'GET', '/reservations/rooms/{roomId}', getRoomReservations);
	
	serverRouter(server, 'POST', '/reservations/{id}', updateTitle);
	
	serverRouter(server, 'PUT', '/reservations/{id}', changeDuration);

	serverRouter(server, 'DELETE', '/reservations/{id}', deleteReservation);
	
	serverRouter(server, 'POST', '/reservations/rooms/{roomId}', createReservation);
	
	serverRouter(server, 'GET', '/reservations/{id}', getSingleReservation);
	
	serverRouter(server, 'GET', '/reservations2', getAllReservations2);
};
