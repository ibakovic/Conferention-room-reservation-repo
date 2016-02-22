'use strict';

var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var moment = require('moment');
var ValidationView = require('./validation.js');
var noty = require('noty');
var reservationDetailsTemplate = require('../../templates/userReservationDetails.html');

var UserReservationDetailsView = ValidationView.extend({
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

  getModel: function(model) {
    this.model = model;
  },

  getId: function(id) {
    this.id = parseInt(id, 10);
    this.model = this.collection.findWhere({id: this.id});
  },

  updateTitle: function() {
    var reservation = this.collection.findWhere({id: this.id});
    var roomId = reservation.get('roomId');
    var path = 'reservations/' + this.model.get('id');
    var title = this.ui.newTitle.html();
    var self = this;

    if(!title) {
      noty({
        text: 'Title missing!',
        layout: 'center',
        type: 'error'
      });
      return;
    }

    var changes = {
      newTitle: title,
      title: title
    };

    reservation.save(changes, {
      wait: true,
      success: function(model, response) {
        noty({
          text: response.msg,
          layout: 'center',
          type: 'success'
        });
        Backbone.history.navigate('calendar/' + roomId, {trigger: true});
      },
      error: function(model, response) {
        noty({
          text: response.responseJSON.msg,
          layout: 'center',
          type: 'error'
        });
      }
    });
  },

  deleteReservation: function() {
    var reservation = this.collection.findWhere({id: this.id});
    var roomId = reservation.get('roomId');
    var self = this;
    var path = 'reservations/' + this.model.get('id');

    if(confirm('Are you sure you want to remove this reservation?')) {
      reservation.destroy({
        wait: true,
        success: function(model, response) {
          noty({
            text: response.msg,
            layout: 'center',
            type: 'error'
          });
          Backbone.history.navigate('calendar/' + roomId, {trigger: true});
        },
        error: function(model, response) {
          noty({
            text: response.responseJSON.msg,
            layout: 'center',
            type: 'error'
          });
        }
      });
    }
  },

  cancelReservation: function() {
    Backbone.history.navigate('calendar/' + this.model.get('roomId'), {trigger: true});
  }
});

module.exports = UserReservationDetailsView;
