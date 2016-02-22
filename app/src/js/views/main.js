'use strict';

var models = require('../models/models.js');
var Backbone = require('backbone');

var UserDetailsView = require('./userReservationDetails.js');
var DetailsView = require('./reservationDetails.js');
var LoginView = require('./login.js');
var CalendarView = require('./calendar.js');
var RegisterView = require('./register.js');
var RoomsView = require('./rooms.js');
var ConfirmRegistration = require('./confirmRegistration.js');

var userDetailsView = new UserDetailsView({collection: models.reservations});
var detailsView = new DetailsView({collection: models.reservations});
var roomsView = new RoomsView({collection: models.rooms});
var confirmRegistration = new ConfirmRegistration();

module.exports = {
  LoginView: LoginView,
  RegisterView: RegisterView,
  userDetailsView: userDetailsView,
  detailsView: detailsView,
  CalendarView: CalendarView,
  roomsView: roomsView,
  confirmRegistration: confirmRegistration
};
