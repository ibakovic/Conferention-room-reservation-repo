'use strict';

var format = require('string-template');
var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var roomsTemplate = require('../../templates/room.hbs');

var RoomView = Marionette.ItemView.extend({
  template: roomsTemplate,

  ui: {
    btnRoomName: '.roomName'
  },

  events: {
    'click @ui.btnRoomName': 'getCalendar'
  },

  getCalendar: function() {
    var roomId = this.model.get('roomId');

    if(roomId === 1) {
      window.localStorage.setItem('fetchCollection', 'roomOneReservations');
    }

    else {
      window.localStorage.setItem('fetchCollection', 'roomTwoReservations');
    }

    var calendarLink = format('calendar/{roomId}/{start}/{calendarView}', {
      roomId: roomId,
      start: this.parent.start,
      calendarView: this.parent.calendarView
    });

    Backbone.history.navigate(calendarLink, {trigger: true});
  }
});

var RoomsView = Marionette.CollectionView.extend({
  childView: RoomView,

  onBeforeAddChild: function(childView) {
    childView.parent = this;
  },

  getRoomId: function(roomId, start, calendarView) {
    this.roomId = roomId;
    this.start = start;
    this.calendarView = calendarView;
  }
});

module.exports = RoomsView;
