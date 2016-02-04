'use strict';

var _ = require('lodash');
var Backbone = require('backbone');
var popsicle = require('popsicle');
var Marionette = require('backbone.marionette');
var router = require('../router.js');
var models = require('../models/models.js');
var loginTemplate = require('../../templates/login.html');

var LoginView = Marionette.ItemView.extend({
	template: loginTemplate,

	events: {
		'click #loginSubmit': 'loginSubmit',
		'click #signUp': 'signUp'
	},

	initialize: function() {
		_.bindAll(this, 'loginSubmit', 'signUp');
	},

	loginSubmit: function() {
		var username = this.$el.find('#loginUsername').val().trim();
		var password = this.$el.find('#loginPassword').val().trim();

		if(!username || !password) {
			alert('Username and password required!');
		}

		popsicle.request({
			method: 'POST',
			url:'login',
			body: {
				username: username,
				password: password
			}
		})
		.then(function LoginSent(res) {
			if(!res.body.success) {
				alert(res.body.msg);
				return;
			}
			models.rooms.fetch({success: function() {
				models.reservations.fetch({success: function(collection, response) {
					router.navigate('calendar/2', {trigger: true});
					alert(res.body.msg);
					return;
				}});
			}});
		})
		.catch(function loginErr(err) {
			console.log(err);
		});
	},

	signUp: function() {
		router.navigate('register', {trigger: true});
	}
});

module.exports = LoginView;
