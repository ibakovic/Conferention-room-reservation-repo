'use strict';

var _ = require('lodash');
var Backbone = require('backbone');
var popsicle = require('popsicle');
var isEmail = require('is-email');
var Marionette = require('backbone.marionette');
var registerTemplate = require('../../templates/register.html');
var Validate = require('./validation.js');

var RegisterView = Validate.extend({
	template: registerTemplate,

	ui: {
		firstName: '#registerFirstName',
		lastName: '#registerLastName',
		username: '#registerUsername',
		password: '#registerPassword',
		email: '#registerEmail'
	},

	events: {
		'click #registerSubmit': 'registerSubmit',
		'click #registerCancel': 'registerCancel'
	},

	registerSubmit: function() {
		var self = this;

		var firstName = this.ui.firstName.val().trim();
		var lastName = this.ui.lastName.val().trim();
		var username = this.ui.username.val().trim();
		var password = this.ui.password.val().trim();
		var email = this.ui.email.val().trim();

		if(!this.validate(this.ui))
			return;

		popsicle.request({
			method: 'POST',
			url: 'register',
			body: {
				firstName: firstName,
				lastName: lastName,
				username: username,
				password: password,
				email: email
			}
		})
		.then(function registerComplete(res) {
			alert(res.body.msg);
			if(res.body.success)
				Backbone.history.navigate('', {trigger: true});
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
