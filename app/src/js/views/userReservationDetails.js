'use strict';

var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var moment = require('moment');
var noty = require('noty');
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

  collectionEvents: {
    'add': 'collectionChanged'
  },

  collectionChanged: function() {
    this.model = this.collection.findWhere({id: this.id});
    this.render();
  },

  initialize: function(options) {
    this.id = parseInt(options.reservationId, 10);
    this.model = this.collection.findWhere({id: this.id});
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
        Backbone.history.navigate('calendar/' + roomId, {trigger: true});
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
              Backbone.history.navigate('calendar/' + roomId, {trigger: true});
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
    Backbone.history.navigate('calendar/' + this.model.get('roomId'), {trigger: true});
  }
});

module.exports = UserReservationDetailsView;
