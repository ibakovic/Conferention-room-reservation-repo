'use strict';

var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var moment = require('moment');
var popsicle = require('popsicle');
var router = require('../router.js');
var reservationDetailsTemplate = require('../../templates/reservationDetails.html');

var ReservationDetailsView = Marionette.ItemView.extend({
	template: reservationDetailsTemplate,

	reservation: {},

	events: {
		'click #updateTitle': 'updateTitle',
		'click #deleteReservation': 'deleteReservation',
		'click #cancelReservation': 'cancelReservation'
	},

	initialize: function() {
		_.bindAll(this, 'render', 'getData', 'updateTitle', 'deleteReservation', 'show', 'hide', 'cancelReservation');
	},

	render: function() {
		var self = this;
		var html = this.template(self.reservation);
		this.$el.html(html);
	},

	getData: function(reservationData) {
		var self = this;
		this.reservation = reservationData;
	},

	updateTitle: function() {
		var path = 'reservations/' + this.reservation.id;
		var title = this.$el.find('#newTitle').val().trim();

		if(!title) {
			alert('New title required!');
			return;
		}

		popsicle.request({
			method: 'POST',
			url: path,
			body: {
				newTitle: title
			}
		})
		.then(function updatedTitle(res) {
			alert(res.body.msg);
			if(res.body.success) {
				router.navigate('', {trigger: true});
			}
		});
	},

	deleteReservation: function() {
		var path = 'reservations/' + this.reservation.id;

		if(confirm('Are you sure you want to remove this reservation?')) {
			popsicle.request({
				method: 'DELETE',
				url: path
			})
			.then(function(res) {
				alert(res.body.msg);
				if(res.body.success) {
					router.navigate('', {trigger: true});
				}
			})
			.catch(function(err) {
				console.log(err);
			});
		}
	},

	show: function() {
		this.$el.show();
	},

	hide: function() {
		this.$el.hide();
	},

	cancelReservation: function() {
		router.navigate('calendar', {trigger: true});
	}
});

module.exports = ReservationDetailsView;
