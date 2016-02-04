'use strict';

var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var popsicle = require('popsicle');
var router = require('../router.js');
var roomsTemplate = require('../../templates/rooms.html');

var RoomsView = Marionette.ItemView.extend({
	template: roomsTemplate,

	roomId: 0,

	events: {
		'click #logout': 'logout'
	},

	initialize: function() {
		_.bindAll(this, 'onShow', 'getRoomId', 'logout');
		//this.listenTo(this.collection, 'reset', this.onShow);
	},

	onShow: function() {
		var self = this;
		var roomName = self.collection.findWhere({roomId: parseInt(self.roomId, 10)}).get('roomName');
		var html = this.template({roomName: roomName});
		this.$el.html(html);
		this.$el.show();
	},

	getRoomId: function(roomId) {
		this.roomId = roomId;
	},

	logout: function() {
		popsicle.request({
			method: 'GET',
			url: 'logout'
		})
		.then(function loggedOut(res) {
			router.navigate('', {trigger: true});
		})
		.catch(function loggoutErr(err) {
			console.log(err);
		});
	}
});

module.exports = RoomsView;
