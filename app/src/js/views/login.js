'use strict';

var _ = require('lodash');
var Backbone = require('backbone');
var popsicle = require('popsicle');
var Marionette = require('backbone.marionette');
var models = require('../models/models.js');
var Validate = require('./validation.js');
var loginTemplate = require('../../templates/login.html');

var LoginView = Validate.extend({
  template: loginTemplate,

  ui: {
    username: '#loginUsername',
    password: '#loginPassword'
  },

  events: {
    'click #loginSubmit': 'loginSubmit',
    'click #signUp': 'signUp'
  },

  loginSubmit: function() {
    var username = this.ui.username.val().trim();
    var password = this.ui.password.val().trim();

    if(!this.validate(this.ui)) {
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

      window.localStorage.setItem('userId', res.body.userId);

      models.rooms.fetch({reset: true});
      models.reservations.fetch({reset: true});

      Backbone.history.navigate('calendar/3', {trigger: true});
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
