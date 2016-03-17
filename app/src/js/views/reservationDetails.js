'use strict';

var $ = require('jquery');
var _ = require('lodash');
var Marionette = require('backbone.marionette');
var moment = require('moment');
var format = require('string-template');
var ValidationView = require('./validation.js');
var reservationDetailsTemplate = require('../../templates/reservationDetails.hbs');

var ReservationDetailsView = Marionette.ItemView.extend({
  template: reservationDetailsTemplate,

  id: 0,

  ui: {
    detailsStart: '#eventDetailStart',
    detailsEnd: '#eventDetailEnd',
    duration: '#reservationDuration',
    btnReturnToCalendar: '#returnToCalendar'
  },

  events: {
    'click @ui.btnReturnToCalendar': 'returnToCalendar'
  },

  onShow: function() {
    var newStart = moment(this.model.get('start')).utc().format('DD.MM.YYYY HH:mm');
    var newEnd = moment(this.model.get('end')).utc().format('DD.MM.YYYY HH:mm');

    var duration = moment(this.model.get('end')).diff(this.model.get('start'));
    duration = moment(duration).utc().format('H [h] mm [min]');

    this.ui.duration.text(duration);
    this.ui.detailsStart.text(newStart);
    this.ui.detailsEnd.text(newEnd);
  },

  returnToCalendar: function() {
    window.history.back();
  }
});

module.exports = ReservationDetailsView;
