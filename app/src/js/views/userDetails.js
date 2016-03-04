'use strict';

var popsicle = require('popsicle');
var $ = require('jquery');
var noty = require('noty');
var format = require('string-template');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var moment = require('moment');
var userDetaisTemplate = require('../../templates/userDetails.html');

var UserDetailsView = Marionette.ItemView.extend({
  template: userDetaisTemplate,

  ui: {
    resetPassword: '#resetPasswordButton',
    back: '#backToCalendarButton',
    userCreatedAt: '#userCreatedAt'
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

  initialize: function(options) {
    this.dateNumber = parseInt(options.dateNumber, 10);
    this.roomId = parseInt(options.roomId, 10);
    this.calendarView = options.calendarView;
  },

  onRender: function() {
    var newCreatedAt = moment(this.model.get('createdAt')).format('DD.MM.YYYY HH:mm');
    this.ui.userCreatedAt.text(newCreatedAt);
  },

  resetPassword: function() {
    var self = this;

    popsicle.request({
      method: 'POST',
      url: 'resetMail',
      body: {
        userStringId: self.model.get('username')
      }
    })
    .then(function resetPasswordRedirect(response) {
      noty({
        text: response.body.msg,
        layout: 'center',
        type: 'success',
        timeout: 4000
      });
    })
    .catch(function resetPasswrodFail(err) {
      console.log(err);
    });
  },

  backToCalendar: function() {
    var calendarLink = format('calendar/{roomId}/{dateNumber}/{calendarView}', {
      roomId: this.roomId,
      dateNumber: this.dateNumber,
      calendarView: this.calendarView
    });
    Backbone.history.navigate(calendarLink, {trigger: true});
  }
});

module.exports = UserDetailsView;
