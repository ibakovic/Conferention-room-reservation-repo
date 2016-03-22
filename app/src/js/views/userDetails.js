'use strict';

var popsicle = require('popsicle');
var $ = require('jquery');
var noty = require('../lib/alert.js');
var format = require('string-template');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var moment = require('moment');
var userDetaisTemplate = require('../../templates/userDetails.hbs');

var UserDetailsView = Marionette.ItemView.extend({
  template: userDetaisTemplate,

  roomId: 0,

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

  returnToCalendar: function() {
    var link = format('calendar/{roomId}/{start}/{calendarView}', {
      roomId: this.roomId,
      start: window.localStorage.getItem('start'),
      calendarView: window.localStorage.getItem('calendarView')
    });

    Backbone.history.navigate(link, {trigger: true});
  },

  initialize: function(options) {
    this.roomId = options.roomId;
  },

  modelChanged: function() {
    this.render();
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
    this.returnToCalendar();
  }
});

module.exports = UserDetailsView;
