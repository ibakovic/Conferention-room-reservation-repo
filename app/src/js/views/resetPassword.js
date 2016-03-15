'use strict';

var noty = require('../lib/alert.js');
var popsicle = require('popsicle');
var $ = require('jquery');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var Validation = require('./validation.js');
var moment = require('moment');
var resetPasswordTemplate = require('../../templates/resetPassword.hbs');

var ResetPasswordView = Validation.extend({
  template: resetPasswordTemplate,

  urlId: '',

  md5: '',

  ui: {
    newPassword: '#newPassword',
    newPasswordConfirmation: '#newPasswordConfirmation',
    btnReset: '#resetPasswordButton',
    btnCancel: '#resetPasswordCancel'
  },

  events: {
    'click @ui.btnReset': 'resetPassword',
    'click @ui.btnCancel': 'cancel'
  },

  initialize: function(options) {
    this.urlId = options.urlId;
    this.md5 = options.md5;

    var now = moment().utc().valueOf();
  },

  onShow: function() {
    this.ui.newPassword.focus();
  },

  resetPassword: function() {
    if(!this.validate(this.ui)) {
      return;
    }

    var newPassword = this.ui.newPassword.val().trim();
    var newPasswordConfirmation = this.ui.newPasswordConfirmation.val().trim();

    if(newPassword !== newPasswordConfirmation) {
      noty('Passwords in both fields must match', 'error', 2500);
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
      noty(response.body.msg, 'information', 2500);

      Backbone.history.navigate('', {trigger: true});
    })
    .catch(function(err) {
      noty(err.message, 'error', 2500);
    });
  },

  cancel: function() {
    Backbone.history.navigate('', {trigger: true});
  }
});

module.exports = ResetPasswordView;
