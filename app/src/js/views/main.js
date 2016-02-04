'use strict';

var models = require('../models/models.js');

var DetailsView = require('./reservationDetails.js');
var LoginView = require('./login.js');
var CalendarView = require('./calendar.js');
var RegisterView = require('./register.js');
var RoomsView = require('./rooms.js');

var loginView = new LoginView();
var registerView = new RegisterView();
var detailsView = new DetailsView({collection: models.reservations});
var calendarView = new CalendarView({collection: models.reservations});
var roomsView = new RoomsView({collection: models.rooms});


module.exports = {
	loginView: loginView,
	registerView: registerView,
	detailsView: detailsView,
	calendarView: calendarView,
	roomsView: roomsView
};