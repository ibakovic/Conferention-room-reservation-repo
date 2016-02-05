'use strict';

var $ = require('jquery');
window.jQuery = window.$ = require('jquery');
var moment = require('moment');
var _ = require('lodash');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var router = require('./router.js');
var views = require('./views/main.js');

var resApp = new Marionette.Application();

resApp.addRegions({
	roomRegion: '#rooms',
	mainRegion: '#app'
});

//////////////////////////////////views to be moved to a separate file
///
///

Backbone.Events.on('getReservationData', function(reservationData) {
	views.detailsView.getData(reservationData);
	views.detailsView.render();
	$('#app').append(views.detailsView.$el);
	router.navigate('reservationDetails', {trigger: true});
});

$('document').ready(function() {
	router.on('route:start', function() {
		if(document.cookie) {
			router.navigate('calendar/2', {trigger: true});
			return;
		}

		resApp.roomRegion.$el.hide();
		resApp.mainRegion.show(views.loginView, {preventDestroy: true});
	});

	router.on('route:register', function() {
		if(document.cookie) {
			router.navigate('calendar/2', {trigger: true});
			return;
		}

		resApp.roomRegion.$el.hide();
		resApp.mainRegion.show(views.registerView, {preventDestroy: true});
	});

	router.on('route:calendar', function(roomId) {
		if(!document.cookie) {
			router.navigate('', {trigger: true});
			return;
		}

		views.calendarView.getRoomId(roomId);
		views.calendarView.createCalendar();
		resApp.mainRegion.show(views.calendarView, {preventDestroy: true});
		
		views.roomsView.getRoomId(roomId);
		resApp.roomRegion.$el.show();
		resApp.roomRegion.show(views.roomsView, {preventDestroy: true});
	});
	
	router.on('route:reservationDetails', function(id) {
		if(!document.cookie) {
			router.navigate('', {trigger: true});
			return;
		}

		resApp.roomRegion.$el.hide();
		views.detailsView.getId(id);
		resApp.mainRegion.show(views.detailsView, {preventDestroy: true});
	});

	resApp.on('start', function() {
		Backbone.history.start();
	});

	resApp.start();
});
