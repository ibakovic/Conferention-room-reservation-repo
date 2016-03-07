'use strict';

var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var moment = require('moment');
var noty = require('noty');
var format = require('string-template');
var reservationDetailsTemplate = require('../../templates/userReservationDetails.html');

var UserReservationDetailsView = Marionette.ItemView.extend({
  template: reservationDetailsTemplate,

  id: 0,

  ui: {
    newTitle: '#newTitle',
    detailsStart: '#userDetailsStart',
    detailsEnd: '#userDetailsEnd',
    updateTitle: '#updateTitle',
    deleteReservation: '#deleteReservation',
    cancelReservation: '#cancelReservation'
  },

  events: {
    'click @ui.updateTitle': 'updateTitle',
    'click @ui.deleteReservation': 'deleteReservation',
    'click @ui.cancelReservation': 'cancelReservation'
  },

  updateTitleSuccess: function(model, response) {
    noty({
      text: response.msg,
      layout: 'center',
      type: 'success',
      timeout: 2500
    });
    var start = moment(this.model.get('start')).utc().valueOf();
    var calendarLink = format('calendar/{roomId}/{start}/{calendarView}', {
      roomId: this.model.get('roomId'),
      start: start,
      calendarView: this.calendarView
    });

    Backbone.history.navigate(calendarLink, {trigger: true});
  },

  error: function(model, response) {
    noty({
      text: response.responseJSON.msg,
      layout: 'center',
      type: 'error',
      timeout: 2500
    });
  },

  deleteReservationSuccess: function(model, response) {
    noty({
      text: response.msg,
      layout: 'center',
      type: 'error',
      timeout: 2500
    });
    var start = moment(this.model.get('start')).utc().valueOf();
    var calendarLink = format('calendar/{roomId}/{start}/{calendarView}', {
      roomId: this.model.get('roomId'),
      start: start,
      calendarView: this.calendarView
    });

    Backbone.history.navigate(calendarLink, {trigger: true});
  },

  deleteReservationYes: function($noty) {
    var self = this;

    this.model.destroy({
      wait: true,
      success: self.deleteReservationSuccess.bind(self),
      error: self.error.bind(self)
    });
    $noty.close();
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

  updateTitle: function() {
    var roomId = this.model.get('roomId');
    var path = 'reservations/' + this.model.get('id');
    var title = this.ui.newTitle.html();
    var self = this;

    if(!title) {
      noty({
        text: 'Title missing!',
        layout: 'center',
        type: 'error',
        timeout: 2500
      });
      return;
    }

    var changes = {
      newTitle: title,
      title: title
    };

    this.model.save(changes, {
      wait: true,
      success: self.updateTitleSuccess.bind(self),
      error: self.error.bind(self)
    });
  },

  deleteReservation: function() {
    var roomId = this.model.get('roomId');
    var self = this;
    var path = 'reservations/' + this.model.get('id');

    noty({
      text: 'Are you sure you want to remove this reservation?',
      layout: 'center',
      type: 'information',
      buttons: [{
        addClass: 'btn btn-success',
        text: 'Yes',
        onClick: self.deleteReservationYes.bind(self)
      },{
        addClass: 'btn btn-danger',
        text: 'No',
        onClick: function($noty) {
          $noty.close();
        }
      }]
    });
  },

  cancelReservation: function() {
    var start = moment(this.model.get('start')).utc().valueOf();

    var calendarLink = format('calendar/{roomId}/{start}/{calendarView}', {
      roomId: this.model.get('roomId'),
      start: start,
      calendarView: this.calendarView
    });

    Backbone.history.navigate(calendarLink, {trigger: true});
  }
});

module.exports = UserReservationDetailsView;
