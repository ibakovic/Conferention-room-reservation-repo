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
		password: '#registerPassword',
		email: '#registerEmail'
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
		var email = this.ui.email.val().trim();
		
		//provjera upisanog!!!
		if(!firstName) {
			alert('First name required!');
			return;
		}

		if(!lastName) {
			alert('Last name required!');
			return;
		}

		if(!username) {
			alert('Username required!');
			return;
		}

		if(!password) {
			alert('Password required!');
			return;
		}

		if(!email) {
			alert('E-mail required!');
			return;
		}

		var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
		if(!pattern.test(email)) {
			alert('Wrong e-mail format!');
			return;
		}

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
