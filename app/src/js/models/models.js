'use strict';

var Backbone = require('backbone');
var _ = require('lodash');
var defer = require('../promises/roomReservation.js');

var User = Backbone.Model.extend({
  url: '/user',
  parse: function parse(response) {
    return response.data;
  }
});

var user = new User();

var SingleReservation = Backbone.Model.extend({
  urlRoot: '/reservations',
  parse: function(response) {
    return response.data;
  }
});

var Reservation = Backbone.Model.extend({
  urlRoot: '/reservations'
});

var Reservations = Backbone.Collection.extend({
  model: Reservation,
  url: '/reservations',
  parse: function(response) {
    return response.data;
  }
});

var reservations = new Reservations();

var RoomOneReservations = Backbone.Collection.extend({
  url: '/reservations/rooms/1',
  model: Reservation,

  parse: function(response) {
    return response.data;
  }
});

var roomOneReservations = new RoomOneReservations();

var RoomTwoReservations = Backbone.Collection.extend({
  url: '/reservations/rooms/2',
  model: Reservation,

  parse: function(response) {
    return response.data;
  }
});

var roomTwoReservations = new RoomTwoReservations();

var Room = Backbone.Model.extend();

var Rooms = Backbone.Collection.extend({
  model: Room,
  url: '/rooms',
  parse: function(response) {
    return response.data;
  }
});

var rooms = new Rooms();

if(document.cookie) {
  user.fetch();
  rooms.fetch();

  if(window.localStorage.getItem('fetchCollection') === 'roomOneReservations') {
    roomOneReservations.fetch({
      success: function(collection1, response) {
        defer.resolve(collection1);
      }
    });
  }

  if(window.localStorage.getItem('fetchCollection') === 'roomTwoReservations') {
    roomTwoReservations.fetch({
      success: function(collection2, response) {
        defer.resolve(collection2);
      }
    });
  }
}

module.exports = {
  SingleReservation: SingleReservation,
  Reservation: Reservation,
  reservations: reservations,
  Room: Room,
  rooms: rooms,
  user: user,
  roomOneReservations: roomOneReservations,
  roomTwoReservations: roomTwoReservations
};
