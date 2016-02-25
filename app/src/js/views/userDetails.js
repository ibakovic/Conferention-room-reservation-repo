'use strict';

var popsicle = require('popsicle');
var $ = require('jquery');
var noty = require('noty');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var userDetaisTemplate = require('../../templates/userDetails.html');

var UserDetailsView = Marionette.ItemView.extend({
  template: userDetaisTemplate,

  ui: {
    resetPassword: '#resetPasswordButton',
    back: '#backToCalendarButton'
  },

  events: {
    'click @ui.resetPassword': 'resetPassword',
    'click @ui.back': 'backToCalendar'
  },

  modelEvents: {
    'change': 'modelChanged'
  },

  modelChanged: function() {
    this.render();
  },

  resetPassword: function() {
    var self = this;
    popsicle.request({
      method: 'POST',
      url: 'resetMail'
    })
    .then(function resetPasswordRedirect(response) {
      noty({
        text: response.body.msg,
        layout: 'center',
        type: 'success',
        timeout: 2500
      });
    })
    .catch(function resetPasswrodFail(err) {
      console.log(err);
    });
  },

  backToCalendar: function() {
    Backbone.history.navigate('calendar/2', {trigger: true});
  }
});

module.exports = UserDetailsView;
