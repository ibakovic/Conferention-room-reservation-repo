'use strict';

var _ = require('lodash');
var Backbone = require('backbone');
var popsicle = require('popsicle');
var isEmail = require('is-email');
var Marionette = require('backbone.marionette');
var registerTemplate = require('../../templates/register.html');
var Validate = require('./validation.js');
var noty = require('noty');

var RegisterView = Validate.extend({
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

  registerSubmit: function() {
    var self = this;

    var firstName = this.ui.firstName.val().trim();
    var lastName = this.ui.lastName.val().trim();
    var username = this.ui.username.val().trim();
    var password = this.ui.password.val().trim();
    var email = this.ui.email.val().trim();

    if(!this.validate(this.ui))
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
      if(!res.body.msg) {
        noty({
          text: res.body.msg,
          layout: 'center',
          type: 'error',
          timeout: 3000
        });
      }

      noty({
        text: res.body.msg,
        layout: 'center',
        type: 'success',
        timeout: 3000
      });
      Backbone.history.navigate('', {trigger: true});
    })
    .catch(function registerError(res) {
      noty({
        text: res.body.msg,
        layout: 'center',
        type: 'error',
        timeout: 3000
      });
    });
  },

  registerCancel: function() {
    Backbone.history.navigate('', {trigger: true});
  }
});

module.exports = RegisterView;
