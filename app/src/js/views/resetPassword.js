'use strict';

var popsicle = require('popsicle');
var $ = require('jquery');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var Validation = require('./validation.js');
var resetPasswordTemplate = require('../../templates/resetPassword.html');

var ResetPasswordView = Validation.extend({
  template: resetPasswordTemplate,

  ui: {
    newPassword: '#newPassword',
    newPasswordConfirmation: '#newPasswordConfirmation'
  },

  events: {
    'click #resetPasswordButton': 'resetPassword',
    'click #resetPasswordCancel': 'cancel'
  },

  initialize: function(options) {
    this.urlId = options.urlId;
  },

  resetPassword: function() {
    if(!this.validate(this.ui)) {
      return;
    }
  },

  cancel: function() {
    Backbone.history.navigate('userDetails', {trigger: true});
  }
});

module.exports = ResetPasswordView;
