'use strict';

var Backbone = require('backbone');
var popsicle = require('popsicle');
var _ = require('lodash');

var SingleReservation = Backbone.Model.extend({
	urlRoot: '/reservations',
	parse: function(response) {
		return response.data;
	}
});

var Reservation = Backbone.Model.extend({});

var Reservations = Backbone.Collection.extend({
	model: Reservation,
	url: '/reservations',
	parse: function(response) {
		return response.data;
	}
});

var reservations = new Reservations();

var Reservations2 = Backbone.Collection.extend({
	model: Reservation
});

var reservationsArray = [];

var Room = Backbone.Model.extend();

var Rooms = Backbone.Collection.extend({
	model: Room,
	url: '/rooms',
	parse: function(response) {
		return response.data;
	}
});

var rooms = new Rooms();

if(document.cookie) {
	rooms.fetch({reset: true});
	reservations.fetch({reset: true});

	popsicle.request({
		method: 'GET',
		url: 'reservations2'
	})
	.then(function (res) {
		_.forEach(res.body.data, function(data) {
			var collection = new Reservations2(data);
			reservationsArray.push(collection);
		});
	});
}

module.exports = {
	reservationsArray: reservationsArray,
	SingleReservation: SingleReservation,
	Reservation: Reservation,
	reservations: reservations,
	Room: Room,
	rooms: rooms
};

//export kao funkciju pa uzet promise