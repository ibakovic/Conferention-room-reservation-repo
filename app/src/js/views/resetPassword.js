'use strict';

var noty = require('noty');
var popsicle = require('popsicle');
var $ = require('jquery');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var Validation = require('./validation.js');
var moment = require('moment');
var resetPasswordTemplate = require('../../templates/resetPassword.html');

var ResetPasswordView = Validation.extend({
  template: resetPasswordTemplate,

  urlId: '',

  md5: '',

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
    this.md5 = options.md5;

    var now = moment().utc().valueOf();
  },

  resetPassword: function() {
    if(!this.validate(this.ui)) {
      return;
    }

    var newPassword = this.ui.newPassword.val().trim();
    var newPasswordConfirmation = this.ui.newPasswordConfirmation.val().trim();

    if(newPassword !== newPasswordConfirmation) {
      noty({
        text: 'Passwords in both fields must match',
        layout: 'center',
        type: 'error',
        timeout: 2500
      });

      return;
    }

    var self = this;
    var url = 'user/' + this.urlId + '/' + this.md5;

    popsicle.request({
      method: 'PUT',
      url: url,
      body: {
        password: self.ui.newPassword.val().trim()
      }
    })
    .then(function(response) {
      noty({
        text: response.body.msg,
        layout: 'center',
        type: 'information',
        timeout: 2500
      });

      Backbone.history.navigate('', {trigger: true});
    })
    .catch(function(err) {
      noty({
        text: err.message,
        layout: 'center',
        type: 'error',
        timeout: 2500
      });
    });
  },

  cancel: function() {
    Backbone.history.navigate('', {trigger: true});
  }
});

module.exports = ResetPasswordView;
