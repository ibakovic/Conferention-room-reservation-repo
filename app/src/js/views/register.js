'use strict';

var _ = require('lodash');
var Backbone = require('backbone');
var popsicle = require('popsicle');
var Marionette = require('backbone.marionette');
var registerTemplate = require('../../templates/register.html');

var RegisterView = Marionette.ItemView.extend({
	template: registerTemplate,

	ui: {
		firstName: '#registerFirstName',
		lastName: '#registerLastName',
		username: '#registerUsername',
		password: '#registerPassword'
	},

	events: {
		'click #registerSubmit': 'registerSubmit',
		'click #registerCancel': 'registerCancel'
	},

	registerSubmit: function() {
		//ItemView ui hash
		var firstName = this.ui.firstName.val().trim();
		var lastName = this.ui.lastName.val().trim();
		var username = this.ui.username.val().trim();
		var password = this.ui.password.val().trim();
		
		//provjera upisanog!!!

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
