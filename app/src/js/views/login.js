'use strict';

var _ = require('lodash');
var Backbone = require('backbone');
var popsicle = require('popsicle');
var Marionette = require('backbone.marionette');
var models = require('../models/models.js');
var Validate = require('./validation.js');
var loginTemplate = require('../../templates/login.hbs');
var noty = require('../lib/alert.js');
var moment = require('moment');
var format = require('string-template');

var LoginView = Validate.extend({
  template: loginTemplate,

  ui: {
    username: '#loginUsername',
    password: '#loginPassword',
    btnSubmit: '#loginSubmit',
    btnSignUp: '#signUp',
    btnResetPassword: '#resetPasswordRequest'
  },

  events: {
    'click @ui.btnSubmit': 'loginSubmit',
    'click @ui.btnSignUp': 'signUp',
    'click @ui.btnResetPassword': 'resetPasswordRequest'
  },

  onShow: function() {
    this.ui.username.focus();
  },

  loginSubmit: function() {
    var username = this.ui.username.val().trim();
    var password = this.ui.password.val().trim();

    if(!this.validate(this.ui)) {
      return;
    }

    popsicle.request({
      method: 'POST',
      url: 'login',
      body: {
        username: username,
        password: password
      }
    })
    .then(function LoginSent(res) {
      if(!res.body.success) {
        noty(res.body.msg, 'error', 2500);
        return;
      }

      window.localStorage.setItem('userId', res.body.userId);
      window.localStorage.setItem('username', res.body.username);
      window.localStorage.setItem('isAdmin', res.body.isAdmin);

      noty(res.body.msg, 'success', 2500);

      var now = moment().utc().valueOf();

      var calendarLink = format('calendar/1/{now}/agendaWeek', {
        now: now
      });

      Backbone.history.navigate(calendarLink, {trigger: true});
    })
    .catch(function loginErr(err) {
      noty(err.message, 'error', 2500);
    });
  },

  signUp: function() {
    Backbone.history.navigate('register', {trigger: true});
  },

  resetPasswordRequest: function() {
    Backbone.history.navigate('resetPasswordRequest', {trigger: true});
  }
});

module.exports = LoginView;
