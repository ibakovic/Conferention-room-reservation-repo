'use strict';

var _ = require('lodash');
var Backbone = require('backbone');
var popsicle = require('popsicle');
var isEmail = require('is-email');
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

	validate: function() {
		var self = this;
		
		var W3CDOM = (document.getElementsByTagName && document.createElement);

		var validForm = true;
		var firstError = null;
		var errorstring = '';

		function validate() {
			validForm = true;
			firstError = null;
			errorstring = '';

			_.forEach(self.ui, function(element) {
				if(!element.val().trim()) {
					writeError(element, 'This field is required!');
				}
			});

			if (!W3CDOM)
				alert(errorstring);

			if (firstError)
				firstError.focus();

			if (validForm) {
				return true;
			}
			
			return false;
		}

		function writeError(obj, message) {
			validForm = false;

			if (obj[0].hasError)
				return;

			if (!firstError)
				firstError = obj;

			if (W3CDOM) {
				obj[0].className += ' registerInputError';
				obj[0].onchange = removeError;

				var sp = document.createElement('div');
				sp.className = 'registerError';
				sp.appendChild(document.createTextNode(message));

				obj[0].parentNode.appendChild(sp);
				obj[0].hasError = sp;

				return;
			}

			errorstring += obj.name + ': ' + message + '\n';
			obj[0].hasError = true;
		}

		function removeError()
		{
			this.className = this.className.substring(0,this.className.lastIndexOf(' '));
			this.parentNode.removeChild(this.hasError);
			this.hasError = null;
			this.onchange = null;
		}

		return validate();
	},

	registerSubmit: function() {
		var self = this;
		//ItemView ui hash
		var firstName = this.ui.firstName.val().trim();
		var lastName = this.ui.lastName.val().trim();
		var username = this.ui.username.val().trim();
		var password = this.ui.password.val().trim();
		var email = this.ui.email.val().trim();

		if(!this.validate())
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
