'use strict';

var $ = require('jquery');
window.jQuery = window.$ = require('jquery');
var moment = require('moment');
var _ = require('lodash');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var nunjucks = require('nunjucks');
var router = require('./router.js');

var DetailsView = require('./views/reservationDetails.js');
var LoginView = require('./views/login.js');
var CalendarView = require('./views/calendar.js');
var RegisterView = require('./views/register.js');

var detailsView = new DetailsView();
var loginView = new LoginView();
var calendarView = new CalendarView();
var registerView = new RegisterView();

var Reservation = Backbone.Model.extend();

var Reservations = Backbone.Collection.extend({
	model: Reservation
	//url: 
});

function hideView(view) {
	view.hide();
}

Backbone.Events.on('getReservationData', function(reservationData) {
	detailsView.getData(reservationData);
	detailsView.render();
});

$('document').ready(function() {
	calendarView.render();
	$('#app').append(calendarView.$el);
	calendarView.createCalendar();
	calendarView.hide();

	loginView.render();
	$('#app').append(loginView.$el);
	loginView.hide();

	registerView.render();
	$('#app').append(registerView.$el);
	registerView.hide();

	detailsView.render();
	$('#app').append(detailsView.$el);
	detailsView.hide();

	router.on('route:start', function() {
		if(document.cookie) {
			router.navigate('calendar', {trigger: true});
			return;
		}

		detailsView.hide();
		calendarView.hide();
		
		loginView.show();
		registerView.show();
	});

	router.on('route:calendar', function() {
		if(!document.cookie) {
			router.navigate('', {trigger: true});
			return;
		}

		detailsView.hide();
		loginView.hide();
		registerView.hide();

		calendarView.show();
	});
	
	router.on('route:reservationDetails', function() {
		if(!document.cookie) {
			router.navigate('', {trigger: true});
			return;
		}
		
		calendarView.hide();
		loginView.hide();
		registerView.hide();

		detailsView.show();
	});

	Backbone.history.start();
});
