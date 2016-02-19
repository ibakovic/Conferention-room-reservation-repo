'use strict';

var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var moment = require('moment');
var ValidationView = require('./validation.js');
var reservationDetailsTemplate = require('../../templates/reservationDetails.html');

var ReservationDetailsView = ValidationView.extend({
  template: reservationDetailsTemplate,

  id: 0,

  ui: {
    newTitle: '#newTitle'
  },

  events: {
    'click #returnToCalendar': 'returnToCalendar'
  },

  getModel: function(model) {
    this.model = model;
  },

  getId: function(id) {
    this.id = parseInt(id, 10);
    this.model = this.collection.findWhere({id: this.id});
  },

  returnToCalendar: function() {
    Backbone.history.navigate('calendar/' + this.model.get('roomId'), {trigger: true});
  }
});

module.exports = ReservationDetailsView;
