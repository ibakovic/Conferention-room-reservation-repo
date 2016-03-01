'use strict';

var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var moment = require('moment');
var format = require('string-template');
var ValidationView = require('./validation.js');
var reservationDetailsTemplate = require('../../templates/reservationDetails.html');

var ReservationDetailsView = Marionette.ItemView.extend({
  template: reservationDetailsTemplate,

  id: 0,

  ui: {
    newTitle: '#newTitle'
  },

  events: {
    'click #returnToCalendar': 'returnToCalendar'
  },

  initialize: function(options) {
    this.calendarView = options.calendarView;
  },

  returnToCalendar: function() {
    var start = moment(this.model.get('start')).utc().valueOf();
    var calendarLink = format('calendar/{roomId}/{start}/{calendarView}', {
      roomId: this.model.get('roomId'),
      start: start,
      calendarView: this.calendarView
    });

    Backbone.history.navigate(calendarLink, {trigger: true});
  }
});

module.exports = ReservationDetailsView;
