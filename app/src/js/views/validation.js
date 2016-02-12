'use strict';

var $ = require('jquery');
var _ = require('lodash');
var isEmail = require('is-email');
var Marionette = require('backbone.marionette');

var Validation = Marionette.ItemView.extend({
	validate: function(elements) {
		var self = this;

		var validForm = true;
		var firstError = null;
		var errorstring = '';

		function validate() {
			validForm = true;
			firstError = null;
			errorstring = '';

			_.forEach(elements, function(element) {
				if(!element.val().trim()) {
					writeError(element, 'This field is required!');
				}
			});

			if(elements.email) {
				if(!isEmail(elements.email.val().trim())) {
					writeError(elements.email, 'This is not a valid e-mail!');
				}
			}

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

			obj[0].className += ' InputError';
			obj[0].onchange = removeError;

			var sp = document.createElement('div');
				sp.className = 'Error input-group-addon';
				sp.appendChild(document.createTextNode(message));

			obj[0].parentNode.appendChild(sp);
			obj[0].hasError = sp;
		}

		function removeError()
		{
			this.className = this.className.substring(0,this.className.lastIndexOf(' '));
			this.parentNode.removeChild(this.hasError);
			this.hasError = null;
			this.onchange = null;
		}

		return validate();
	}
});

module.exports = Validation;
