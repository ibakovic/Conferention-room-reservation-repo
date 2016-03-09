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
    btnReturnToCalendar: '#returnToCalendar'
  },

  events: {
    'click @ui.btnReturnToCalendar': 'returnToCalendar'
  },

  onShow: function() {
    var newStart = moment(this.model.get('start')).format('DD.MM.YYYY HH:mm');
    var newEnd = moment(this.model.get('end')).format('DD.MM.YYYY HH:mm');

    this.ui.detailsStart.text(newStart);
    this.ui.detailsEnd.text(newEnd);
  },

  returnToCalendar: function() {
    window.history.back();
  }
});

module.exports = ReservationDetailsView;
