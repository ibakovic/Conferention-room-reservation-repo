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

var singleReservation = new SingleReservation();

var Reservation = Backbone.Model.extend({
  urlRoot: '/reservations'
});

var Room = Backbone.Model.extend();

var Rooms = Backbone.Collection.extend({
  model: Room,
  url: '/rooms',
  parse: function(response) {
    return response.data;
  }
});

var rooms = new Rooms();

module.exports = {
  SingleReservation: SingleReservation,
  singleReservation: singleReservation,
  Reservation: Reservation,
  Room: Room,
  rooms: rooms,
  user: user
};
