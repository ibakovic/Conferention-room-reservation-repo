'use strict';

var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var moment = require('moment');
var popsicle = require('popsicle');
//var router = require('../router.js');
var reservationDetailsTemplate = require('../../templates/reservationDetails.html');

var ReservationDetailsView = Marionette.ItemView.extend({
	template: reservationDetailsTemplate,

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
	getModel: function(model) {
		this.model = model;
	},

	updateTitle: function() {
		var reservation = this.collection.findWhere({id: this.model.get('id')});
		var path = 'reservations/' + this.model.get('id');
		var title = this.$el.find('#newTitle').val().trim();
		var self = this;

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
				Backbone.history.navigate('calendar/' + self.model.get('roomId'), {trigger: true});
			}
		});
	},

	deleteReservation: function() {
		var reservation = this.collection.findWhere({id: this.model.get('id')});
		var self = this;
		var path = 'reservations/' + this.model.get('id');

		if(confirm('Are you sure you want to remove this reservation?')) {
			popsicle.request({
				method: 'DELETE',
				url: path
			})
			.then(function(res) {
				alert(res.body.msg);
				if(res.body.success) {
					Backbone.history.navigate('calendar/' + self.model.get('roomId'), {trigger: true});
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
		Backbone.history.navigate('calendar/' + this.model.get('roomId'), {trigger: true});
	}
});

module.exports = ReservationDetailsView;
