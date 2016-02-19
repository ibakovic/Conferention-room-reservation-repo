'use strict';

var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var moment = require('moment');
var popsicle = require('popsicle');
var ValidationView = require('./validation.js');
var reservationDetailsTemplate = require('../../templates/userReservationDetails.html');

var UserReservationDetailsView = ValidationView.extend({
	template: reservationDetailsTemplate,

	id: 0,

	ui: {
		newTitle: '#newTitle'
	},

	events: {
		'click #updateTitle': 'updateTitle',
		'click #deleteReservation': 'deleteReservation',
		'click #cancelReservation': 'cancelReservation'
	},

	getModel: function(model) {
		this.model = model;
	},

	getId: function(id) {
		this.id = parseInt(id, 10);
		this.model = this.collection.findWhere({id: this.id});
	},

	updateTitle: function() {
		var reservation = this.collection.findWhere({id: this.id});
		var roomId = reservation.get('roomId');
		var path = 'reservations/' + this.model.get('id');
		var title = this.ui.newTitle.val().trim();
		var self = this;

		if(!this.validate(this.ui)) {
			return;
		}

		var changes = {
			newTitle: title,
			title: title
		};

		reservation.save(changes, {
			wait: true,
			success: function(model, response) {
				alert(response.msg);
				Backbone.history.navigate('calendar/' + roomId, {trigger: true});
			},
			error: function(model, response) {
				alert('Not authorized to update that reservation!');
			}
		});
	},

	deleteReservation: function() {
		var reservation = this.collection.findWhere({id: this.id});
		var roomId = reservation.get('roomId');
		var self = this;
		var path = 'reservations/' + this.model.get('id');

		if(confirm('Are you sure you want to remove this reservation?')) {
			reservation.destroy({
				wait: true,
				success: function(model, response) {
					alert(response.msg);
					Backbone.history.navigate('calendar/' + roomId, {trigger: true});
				},
				error: function(model, response) {
					alert('Not authorized to delete this reservation!');
				}
			});
		}
	},

	cancelReservation: function() {
		Backbone.history.navigate('calendar/' + this.model.get('roomId'), {trigger: true});
	}
});

module.exports = UserReservationDetailsView;
