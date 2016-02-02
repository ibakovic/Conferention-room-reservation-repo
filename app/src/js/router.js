'use strict';

var $ = require('jquery');
var Backbone = require('backbone');

var Router = Backbone.Router.extend({
  routes: {
		'':'start',
		'calendar': 'calendar',
		'reservationDetails': 'reservationDetails'
	}
});

var router = new Router();

module.exports = router;
