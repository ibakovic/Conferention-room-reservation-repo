'use strict';

var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var popsicle = require('popsicle');
var roomsTemplate = require('../../templates/rooms.html');

var RoomView = Marionette.ItemView.extend({
  template: roomsTemplate,

  events: {
    'click .roomName': 'getCalendar'
  },

  getCalendar: function() {
    var roomId = this.model.get('roomId');
    Backbone.history.navigate('calendar/' + roomId, {trigger: true});
  }
});

var RoomsView = Marionette.CollectionView.extend({
  childView: RoomView,

  roomId: 0,

  getRoomId: function(roomId) {
    this.roomId = roomId;
  }
});

module.exports = RoomsView;
