'use strict';

var $ = require('jquery');
window.jQuery = window.$ = require('jquery');
var moment = require('moment');
var _ = require('lodash');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var nunjucks = require('nunjucks');

var LoginView = require('./views/login.js');
var CalendarView = require('./views/calendar.js');
var RegisterView = require('./views/register.js');

var loginView = new LoginView();
var calendarView = new CalendarView();
var registerView = new RegisterView();

$('document').ready(function() {
	//if(document.cookie) {
		console.log('run dammit');
		calendarView.render();
		$('#app').append(calendarView.$el);
		calendarView.createCalendar();
		//return;
	//}

	console.log(document.cookie);

	loginView.render();
	$('#app').append(loginView.$el);

	registerView.render();
	$('#app').append(registerView.$el);
});
