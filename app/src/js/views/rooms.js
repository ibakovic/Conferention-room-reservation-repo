'use strict';

var format = require('string-template');
var popsicle = require('popsicle');
var noty = require('../lib/alert.js');
var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var roomsTemplate = require('../../templates/room.hbs');
var navbarTemplate = require('../../templates/navbar.hbs');

var RoomView = Marionette.ItemView.extend({
  tagName: 'li',

  template: roomsTemplate,

  ui: {
    btnRoomName: '.roomName'
  },

  events: {
    'click @ui.btnRoomName': 'getCalendar'
  },

  onShow: function() {
    var roomId = this.model.get('roomId');

    if(roomId === this.parent.roomId) {
      this.$el.css('background-color', '#E3E3E3');
    }
  },

  getCalendar: function() {
    var roomId = this.model.get('roomId');

    var calendarLink = format('calendar/{roomId}/{start}/{calendarView}', {
      roomId: roomId,
      start: this.parent.start,
      calendarView: this.parent.calendarView
    });

    window.localStorage.setItem('maxDuration', this.model.get('maxDuration'));

    Backbone.history.navigate(calendarLink, {trigger: true});
  }
});

var RoomsView = Marionette.CompositeView.extend({
  tagName: 'div',

  childViewContainer: '#cityDropdown',

  template: navbarTemplate,

  childView: RoomView,

  roomId: 0,
  start: '',
  claendarView: '',

  ui: {
    btnDropdown: '#dropdownButton',
    btnUserDetails: '#userDetailsRedirect',
    btnLogout: '#logout'
  },

  events: {
    'click @ui.btnUserDetails': 'userDetails',
    'click @ui.btnLogout': 'logout'
  },

  onBeforeAddChild: function(childView) {
    childView.parent = this;
  },

  initialize: function(options) {
    this.roomId = options.roomId;
    this.start = options.start;
    this.calendarView = options.eventView;
  },

  onShow: function() {
    var username = window.localStorage.getItem('username');
    var rights = ' (Regular user)';

    if(window.localStorage.getItem('isAdmin') === 'true') {
      rights = ' (Admin)';
    }

    this.ui.btnUserDetails.text(username + rights);
  },

  userDetails: function() {
    var userDetailsLink = format('userDetails/{roomId}', {
      roomId: this.roomId
    });

    Backbone.history.navigate(userDetailsLink, {trigger: true});
  },

  logout: function() {
    popsicle.request({
      method: 'GET',
      url: 'logout'
    })
    .then(function loggedOut(res) {
      noty('Good bye!', 'success', 2500);
      Backbone.history.navigate('', {trigger: true});
    })
    .catch(function loggoutErr(err) {
      noty(err.body.msg, 'error', 2500);
    });
  }
});

module.exports = RoomsView;
