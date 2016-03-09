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
  Reservation: Reservation,
  Room: Room,
  rooms: rooms,
  user: user
};
