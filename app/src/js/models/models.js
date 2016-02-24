'use strict';

var Backbone = require('backbone');
var _ = require('lodash');

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
  reservations.fetch();
}

module.exports = {
  SingleReservation: SingleReservation,
  Reservation: Reservation,
  reservations: reservations,
  Room: Room,
  rooms: rooms,
  user: user
};
