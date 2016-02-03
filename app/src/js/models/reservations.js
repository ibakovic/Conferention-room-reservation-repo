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

if(document.cookie) {
	reservations.fetch({reset: true});
}

module.exports = {
	Reservation: Reservation,
	reservations: reservations
};
