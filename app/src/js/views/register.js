'use strict';

var _ = require('lodash');
var Backbone = require('backbone');
var popsicle = require('popsicle');
var Marionette = require('backbone.marionette');
//var router = require('../router.js');
var registerTemplate = require('../../templates/register.html');

var RegisterView = Marionette.ItemView.extend({
	template: registerTemplate,

	events: {
		'click #registerSubmit': 'registerSubmit',
		'click #registerCancel': 'registerCancel'
	},

	registerSubmit: function() {
		//ItemView ui hash
		var firstName = this.$el.find('#registerFirstName').val().trim();
		var lastName = this.$el.find('#registerLastName').val().trim();
		var username = this.$el.find('#registerUsername').val().trim();
		var password = this.$el.find('#registerPassword').val().trim();

		popsicle.request({
			method: 'POST',
			url: 'register',
			body: {
				firstName: firstName,
				lastName: lastName,
				username: username,
				password: password
			}
		})
		.then(function registerComplete(res) {
			alert(res.body.msg);
		})
		.catch(function registerError(res) {
			alert(res);
		});
	},

	registerCancel: function() {
		Backbone.history.navigate('', {trigger: true});
	}
});

module.exports = RegisterView;
