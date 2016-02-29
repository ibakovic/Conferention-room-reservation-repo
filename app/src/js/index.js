'use strict';

var $ = require('jquery');
window.jQuery = window.$ = require('jquery');
var localstorage = window.localStorage;
var moment = require('moment');
var _ = require('lodash');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');

if (window.__agent) {
  window.__agent.start(Backbone, Marionette);
}

var views = require('./views/main.js');
var models = require('./models/models.js');

var resApp = new Marionette.Application();

resApp.addRegions({
  roomRegion: '#rooms',
  mainRegion: '#app'
});

var routerController = Marionette.Object.extend({
  start: function() {
    if(document.cookie) {
      Backbone.history.navigate('calendar/2', {trigger: true});
      return;
    }

    resApp.roomRegion.$el.hide();
    resApp.mainRegion.show(new views.LoginView());
  },

  register: function() {
    if(document.cookie) {
      Backbone.history.navigate('calendar/2', {trigger: true});
      return;
    }

    resApp.roomRegion.$el.hide();
    resApp.mainRegion.show(new views.RegisterView());
  },

  calendar: function(roomId) {
    if(!document.cookie) {
      Backbone.history.navigate('', {trigger: true});
      return;
    }

    resApp.mainRegion.show(new views.CalendarView({
      collection: models.reservations,
      roomId: roomId
    }), {preventDestroy: true});

    views.roomsView.getRoomId(roomId);
    resApp.roomRegion.$el.show();
    resApp.roomRegion.show(views.roomsView);
  },

  userReservationDetails: function(id) {
    if(!document.cookie) {
      Backbone.history.navigate('', {trigger: true});
      return;
    }

    resApp.roomRegion.$el.hide();

    resApp.mainRegion.show(new views.UserReservationView({
      collection: models.reservations,
      reservationId: id
    }));
  },

  reservationDetails: function(id) {
    if(!document.cookie) {
      Backbone.history.navigate('', {trigger: true});
      return;
    }

    resApp.roomRegion.$el.hide();

    var reservation = new models.SingleReservation({id: parseInt(id, 10)});

    reservation.fetch({
      success: function(model, response) {
        resApp.mainRegion.show(new views.ReservationView({
          model: model
        }));
      }
    });
    //model.set({start: moment(model.get('start')).utc().format('DD.MM.YYYY. HH:mm')});
    //model.set({end: moment(model.get('end')).utc().format('DD.MM.YYYY. HH:mm')});
  },

  confirmRegistration: function(id) {
    resApp.roomRegion.$el.hide();

    views.confirmRegistration.getId(id);
    resApp.mainRegion.show(views.confirmRegistration, {preventDestroy: true});
  },

  userDetails: function (roomId) {
    if(!document.cookie) {
      Backbone.history.navigate('', {trigger: true});
      return;
    }

    resApp.roomRegion.$el.hide();

    resApp.mainRegion.show(new views.UserDetailsView({
      model: models.user,
      roomId: roomId
    }), {preventDestroy: true});
  },

  resetPassword: function(urlId) {
    if(!document.cookie) {
      Backbone.history.navigate('', {trigger: true});
      return;
    }

    resApp.roomRegion.$el.hide();
    resApp.mainRegion.show(new views.ResetPassword({urlId: urlId}), {preventDestroy: true});
  }
});

var Router = Marionette.AppRouter.extend({
  controller: new routerController(),
  appRoutes: {
    '':'start',
    'register': 'register',
    'calendar/:roomId': 'calendar',
    'userReservationDetails/:id': 'userReservationDetails',
    'reservationDetails/:id': 'reservationDetails',
    'confirm/:id': 'confirmRegistration',
    'userDetails/:roomId': 'userDetails',
    'resetPassword/:urlId': 'resetPassword'
  }
});

$('document').ready(function() {
  resApp.on('start', function() {
    var router = new Router();

    if(!Backbone.history.start()) {
      Backbone.history.navigate('', {trigger: true});
    }
  });

  resApp.start();
});
