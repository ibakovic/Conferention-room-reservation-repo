'use strict';

var _ = require('lodash');
var Backbone = require('backbone');
var popsicle = require('popsicle');
var Marionette = require('backbone.marionette');
//var router = require('../router.js');
var models = require('../models/models.js');
var loginTemplate = require('../../templates/login.html');

var LoginView = Marionette.ItemView.extend({
	template: loginTemplate,

	ui: {
		username: '#loginUsername',
		password: '#loginPassword'
	},

	events: {
		'click #loginSubmit': 'loginSubmit',
		'click #signUp': 'signUp'
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
				obj[0].className += ' loginInputError';
				obj[0].onchange = removeError;

				var sp = document.createElement('div');
				sp.className = 'loginError';
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

	loginSubmit: function() {
		var username = this.ui.username.val().trim();
		var password = this.ui.password.val().trim();

		if(!this.validate()) {
			return;
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
					Backbone.history.navigate('calendar/2', {trigger: true});
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
		Backbone.history.navigate('register', {trigger: true});
	}
});

module.exports = LoginView;
