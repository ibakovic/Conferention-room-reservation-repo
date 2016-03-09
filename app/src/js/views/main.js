'use strict';

var models = require('../models/models.js');
var Backbone = require('backbone');

var UserReservationView = require('./userReservationDetails.js');
var ReservationView = require('./reservationDetails.js');
var LoginView = require('./login.js');
var CalendarView = require('./calendar.js');
var RegisterView = require('./register.js');
var RoomsView = require('./rooms.js');
var ConfirmRegistration = require('./confirmRegistration.js');
var UserDetailsView = require('./userDetails.js');
var ResetPassword = require('./resetPassword.js');
var ResetPasswordRequest = require('./resetPasswordRequest.js');

var confirmRegistration = new ConfirmRegistration();

module.exports = {
  LoginView: LoginView,
  RegisterView: RegisterView,
  UserReservationView: UserReservationView,
  ReservationView: ReservationView,
  CalendarView: CalendarView,
  RoomsView: RoomsView,
  confirmRegistration: confirmRegistration,
  UserDetailsView: UserDetailsView,
  ResetPassword: ResetPassword,
  ResetPasswordRequest: ResetPasswordRequest
};
