'use strict';

var Backbone = require('backbone');

var Reservation = Backbone.Model.extend();

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
	Reservation: Reservation,
	reservations: reservations,
	Room: Room,
	rooms: rooms
};
