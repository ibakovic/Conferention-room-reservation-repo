'use strict';

var _ = require('lodash');
var Backbone = require('backbone');
var popsicle = require('popsicle');
var isEmail = require('is-email');
var Marionette = require('backbone.marionette');
var registerTemplate = require('../../templates/register.hbs');
var Validate = require('./validation.js');
var noty = require('../lib/alert.js');

var RegisterView = Validate.extend({
  template: registerTemplate,

  ui: {
    firstName: '#registerFirstName',
    lastName: '#registerLastName',
    username: '#registerUsername',
    password: '#registerPassword',
    email: '#registerEmail',
    btnSubmit: '#registerSubmit',
    btnCancel: '#registerCancel'
  },

  events: {
    'click @ui.btnSubmit': 'registerSubmit',
    'click @ui.btnCancel': 'registerCancel'
  },

  onShow: function() {
    this.ui.firstName.focus();
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
      if(!res.body.success) {
        noty(res.body.msg, 'error', 2500);
        return;
      }

      noty(res.body.msg, 'success', 2500);
      Backbone.history.navigate('', {trigger: true});
    })
    .catch(function registerError(res) {
      noty(res.body.msg, 'error', 2500);
    });
  },

  registerCancel: function() {
    Backbone.history.navigate('', {trigger: true});
  }
});

module.exports = RegisterView;
