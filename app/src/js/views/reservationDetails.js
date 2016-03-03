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
    detailsStart: '#eventDetailStart',
    detailsEnd: '#eventDetailEnd',
    returnToCalendar: '#returnToCalendar'
  },

  events: {
    'click #returnToCalendar': 'returnToCalendar'
  },

  initialize: function(options) {
    this.calendarView = options.calendarView;
  },

  onShow: function() {
    var newStart = moment(this.model.get('start')).format('DD.MM.YYYY HH:mm');
    var newEnd = moment(this.model.get('end')).format('DD.MM.YYYY HH:mm');

    this.ui.detailsStart.text(newStart);
    this.ui.detailsEnd.text(newEnd);
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
