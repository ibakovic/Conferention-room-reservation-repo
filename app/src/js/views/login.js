'use strict';

var _ = require('lodash');
var Backbone = require('backbone');
var popsicle = require('popsicle');
var Marionette = require('backbone.marionette');
var models = require('../models/models.js');
var Validate = require('./validation.js');
var loginTemplate = require('../../templates/login.html');
var noty = require('noty');
var moment = require('moment');
var format = require('string-template');
var deffers = require('../promises/roomReservation.js');
var q = require('q');

var LoginView = Validate.extend({
  template: loginTemplate,

  ui: {
    username: '#loginUsername',
    password: '#loginPassword'
  },

  events: {
    'click #loginSubmit': 'loginSubmit',
    'click #signUp': 'signUp',
    'click #resetPasswordRequest': 'resetPasswordRequest'
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
        noty({
          text: res.body.msg,
          layout: 'center',
          type: 'error',
          timeout: 2500
        });
        return;
      }

      window.localStorage.setItem('userId', res.body.userId);
      window.localStorage.setItem('fetchCollection', 'roomOneReservations');

      models.rooms.fetch({reset: true});
      models.user.fetch();
      noty({
          text: res.body.msg,
          layout: 'center',
          type: 'success',
          timeout: 2500
        });

      var now = moment().utc().valueOf();

      var calendarLink = format('calendar/1/{now}/agendaWeek', {
        now: now
      });

      Backbone.history.navigate(calendarLink, {trigger: true});
    })
    .catch(function loginErr(err) {
      noty({
        text: err.message,
        layout: 'center',
        type: 'error',
        timeout: 2500
      });
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
