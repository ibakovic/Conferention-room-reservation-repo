'use strict';

var $ = require('jquery');
var _ = require('lodash');
var Marionette = require('backbone.marionette');
var moment = require('moment');
var noty = require('noty');
var notification = require('../lib/alert.js');
var format = require('string-template');
var reservationDetailsTemplate = require('../../templates/userReservationDetails.hbs');

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
    notification(response.msg, 'success', 2500);

    window.history.back();
  },

  error: function(model, response) {
    notification(response.responseJSON.msg, 'error', 2500);
  },

  deleteReservationSuccess: function(model, response) {
    notification(response.msg, 'error', 2500);
    window.history.back();
  },

  deleteReservationYes: function($noty) {
    var self = this;

    this.model.destroy({
      wait: true,
      success: self.deleteReservationSuccess.bind(self),
      error: self.error.bind(self)
    });

    location.reload();
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
      notification('Title missing!', 'error', 2500);
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
    window.history.back();
  }
});

module.exports = UserReservationDetailsView;
