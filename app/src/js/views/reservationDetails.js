'use strict';

var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var moment = require('moment');
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
    this.id = options.reservationId;
  },

  onDomRefresh: function() {
    console.log(this.model);
    Backbone.history.navigate('reservationDetails/' + this.id, {trigger: true});
  },

  returnToCalendar: function() {
    Backbone.history.navigate('calendar/' + this.model.get('roomId'), {trigger: true});
  }
});

module.exports = ReservationDetailsView;
