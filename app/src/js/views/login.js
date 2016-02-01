'use strict';

var _ = require('lodash');
var Backbone = require('backbone');
var popsicle = require('popsicle');
var Marionette = require('backbone.marionette');
var loginTemplate = require('../../templates/login.html');

var LoginView = Marionette.ItemView.extend({
	template: loginTemplate,

	events: {
		'click #loginSubmit': 'loginSubmit',
		'click #loginCancel': 'loginCancel'
	},

	initialize: function() {
		_.bindAll(this, 'loginSubmit', 'loginCancel');
	},

	loginSubmit: function() {
		var username = this.$el.find('#loginUsername').val().trim();
		var password = this.$el.find('#loginPassword').val().trim();

		popsicle.request({
			method: 'POST',
			url:'login',
			body: {
				username: username,
				password: password
			}
		})
		.then(function LoginSent(res) {
			alert(res.body.msg);
		});
	},

	loginCancel: function() {
		console.log('Cancel login');
	}
});

module.exports = LoginView;
