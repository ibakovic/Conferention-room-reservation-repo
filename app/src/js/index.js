'use strict';

var $ = require('jquery');
window.jQuery = window.$ = require('jquery');
var moment = require('moment');
var _ = require('lodash');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var nunjucks = require('nunjucks');
var router = require('./router.js');
var models = require('./models/reservations.js');

var resApp = new Marionette.Application();

resApp.addRegions({
	mainRegion: '#app'
});

//////////////////////////////////views to be moved to a separate file
///
///
var DetailsView = require('./views/reservationDetails.js');
var LoginView = require('./views/login.js');
var CalendarView = require('./views/calendar.js');
var RegisterView = require('./views/register.js');

var detailsView = new DetailsView();
var calendarView = new CalendarView({collection: models.reservations});

Backbone.Events.on('getReservationData', function(reservationData) {
	detailsView.getData(reservationData);
	detailsView.render();
	$('#app').append(detailsView.$el);
	router.navigate('reservationDetails', {trigger: true});
});

$('document').ready(function() {
	router.on('route:start', function() {
		if(document.cookie) {
			router.navigate('calendar', {trigger: true});
			return;
		}

		resApp.mainRegion.show(new LoginView(), {preventDestroy: true});
	});

	router.on('route:register', function() {
		if(document.cookie) {
			router.navigate('calendar', {trigger: true});
			return;
		}

		resApp.mainRegion.show(new RegisterView(), {preventDestroy: true});
	});

	router.on('route:calendar', function() {
		if(!document.cookie) {
			router.navigate('', {trigger: true});
			return;
		}
		
		resApp.mainRegion.show(calendarView, {preventDestroy: true});
	});
	
	router.on('route:reservationDetails', function() {
		if(!document.cookie) {
			router.navigate('', {trigger: true});
			return;
		}
		resApp.mainRegion.show(detailsView, {preventDestroy: true});
	});

	resApp.on('start', function() {
		Backbone.history.start();
	});

	resApp.start();
});
