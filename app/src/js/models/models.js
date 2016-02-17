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

var Reservation = Backbone.Model.extend({
	urlRoot: '/reservations',
	/*parse: function(response) {
		return response.data;
	}*/
});

var Reservations = Backbone.Collection.extend({
	model: Reservation,
	url: '/reservations',
	parse: function(response) {
		return response.data;
	}
});

var reservations = new Reservations();

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
}

module.exports = {
	SingleReservation: SingleReservation,
	Reservation: Reservation,
	reservations: reservations,
	Room: Room,
	rooms: rooms
};

//export kao funkciju pa uzet promise