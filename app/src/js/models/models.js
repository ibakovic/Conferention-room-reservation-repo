'use strict';

var Backbone = require('backbone');
var _ = require('lodash');
var deffers = require('../promises/roomReservation.js');

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
  roomOneReservations.fetch({
    success: function(collection, response) {
      deffers.defRoomOne.resolve(collection);
    }
  });

  roomTwoReservations.fetch({
    success: function(collection, response) {
      deffers.defRoomTwo.resolve(collection);
    }
  });
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
