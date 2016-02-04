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

	reservationId: 0,

	events: {
		'click #updateTitle': 'updateTitle',
		'click #deleteReservation': 'deleteReservation',
		'click #cancelReservation': 'cancelReservation'
	},
/*
	collectionEvents: {
    "reset": "onShow"
  },
*/
	onShow: function() {
		var self = this;
		var reservation = this.collection.findWhere({id: parseInt(self.reservationId, 10)});
		var html = this.template({
			title: reservation.get('title'),
			id: self.reservationId,
			roomId: reservation.get('roomId'),
			start: reservation.get('start'),
			end: reservation.get('end')
		});
		this.$el.html(html);
	},

	getId: function(id) {
		this.reservationId = id;
	},

	updateTitle: function() {
		var reservation = this.collection.findWhere({id: parseInt(this.reservationId, 10)});
		var path = 'reservations/' + this.reservationId + '/' + reservation.get('roomId');
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
				router.navigate('calendar/' + reservation.get('roomId'), {trigger: true});
			}
		});
	},

	deleteReservation: function() {
		var reservation = this.collection.findWhere({id: parseInt(this.reservationId, 10)});
		var path = 'reservations/' + this.reservationId + '/' + reservation.get('roomId');

		if(confirm('Are you sure you want to remove this reservation?')) {
			popsicle.request({
				method: 'DELETE',
				url: path
			})
			.then(function(res) {
				alert(res.body.msg);
				if(res.body.success) {
					router.navigate('calendar/' + reservation.get('roomId'), {trigger: true});
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
		var reservation = this.collection.findWhere({id: parseInt(this.reservationId, 10)});

		router.navigate('calendar/' + reservation.get('roomId'), {trigger: true});
	}
});

module.exports = ReservationDetailsView;
