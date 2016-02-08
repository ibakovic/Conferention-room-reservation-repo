'use strict';

var $ = require('jquery');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');

var Router = Backbone.Router.extend({
  routes: {
		'':'start',
		'register': 'register',
		'calendar/:roomId': 'calendar',
		'reservationDetails/:id': 'reservationDetails'
	}
});

var router = new Router();

module.exports = router;
