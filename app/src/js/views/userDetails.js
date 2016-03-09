'use strict';

var popsicle = require('popsicle');
var $ = require('jquery');
var noty = require('../lib/alert.js');
var format = require('string-template');
var Marionette = require('backbone.marionette');
var moment = require('moment');
var userDetaisTemplate = require('../../templates/userDetails.hbs');

var UserDetailsView = Marionette.ItemView.extend({
  template: userDetaisTemplate,

  ui: {
    resetPassword: '#resetPasswordButton',
    back: '#backToCalendarButton',
    userCreatedAt: '#userCreatedAt'
  },

  events: {
    'click @ui.resetPassword': 'resetPasswordRequest',
    'click @ui.back': 'backToCalendar'
  },

  modelEvents: {
    'change': 'modelChanged'
  },

  modelChanged: function() {
    this.render();
  },

  initialize: function(options) {
    this.dateNumber = parseInt(options.dateNumber, 10);
    this.roomId = parseInt(options.roomId, 10);
    this.calendarView = options.calendarView;
  },

  onRender: function() {
    var newCreatedAt = moment(this.model.get('createdAt')).format('DD.MM.YYYY HH:mm');
    this.ui.userCreatedAt.text(newCreatedAt);
  },

  resetPasswordRequest: function() {
    var self = this;

    popsicle.request({
      method: 'POST',
      url: 'resetMail',
      body: {
        userStringId: self.model.get('username')
      }
    })
    .then(function resetPasswordRedirect(response) {
      noty(response.body.msg, 'success', 4000);
    })
    .catch(function resetPasswrodFail(err) {
      console.log(err);
    });
  },

  backToCalendar: function() {
    window.history.back();
  }
});

module.exports = UserDetailsView;
