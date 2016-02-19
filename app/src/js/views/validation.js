'use strict';

var $ = require('jquery');
var _ = require('lodash');
var isEmail = require('is-email');
var Marionette = require('backbone.marionette');

var Validation = Marionette.ItemView.extend({
  validate: function(elements) {
    var validForm = true;
    var firstError = null;

    function validate() {
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

      if(obj[0].hasError) {
        return;
      }

      if(!firstError) {
        firstError = obj;
      }

      obj.addClass('InputError');
      obj.change(function removeError() {
        $(this).removeClass('InputError');
        $(this).parent().find($('.Error')).remove();
        $(this)[0].hasError = null;
      });

      obj[0].hasError = true;

      var errorWarning = $('<div class="Error input-group-addon">' + message + '</div>');

      obj.parent().append(errorWarning);
    }

    return validate();
  }
});

module.exports = Validation;
