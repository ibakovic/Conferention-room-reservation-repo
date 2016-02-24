'use strict';

var noty = require('noty');
var $ = require('jquery');
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

  resetPassword: function() {},

  backToCalendar: function() {
    Backbone.history.navigate('calendar/2', {trigger: true});
  }
});

module.exports = UserDetailsView;
