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
    newTitle: '#newTitle'
  },

  events: {
    'click #updateTitle': 'updateTitle',
    'click #deleteReservation': 'deleteReservation',
    'click #cancelReservation': 'cancelReservation'
  },

  initialize: function(options) {
    this.calendarView = options.calendarView;
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
      success: function(model, response) {
        noty({
          text: response.msg,
          layout: 'center',
          type: 'success',
          timeout: 2500
        });
        var start = moment(self.model.get('start')).utc().valueOf();
        var calendarLink = format('calendar/{roomId}/{start}/{calendarView}', {
          roomId: self.model.get('roomId'),
          start: start,
          calendarView: self.calendarView
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
      }
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
        onClick: function($noty) {
          self.model.destroy({
            wait: true,
            success: function(model, response) {
              noty({
                text: response.msg,
                layout: 'center',
                type: 'error',
                timeout: 2500
              });
              var start = moment(self.model.get('start')).utc().valueOf();
              var calendarLink = format('calendar/{roomId}/{start}/{calendarView}', {
                roomId: self.model.get('roomId'),
                start: start,
                calendarView: self.calendarView
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
            }
          });
          $noty.close();
        }
      },{
        addClass: 'btn btn-danger',
        text: 'No',
        onClick: function($noty) {
          $noty.close();
        }
      }]
    });

    if(confirm) {

    }
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
