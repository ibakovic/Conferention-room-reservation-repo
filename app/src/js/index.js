'use strict';

var $ = require('jquery');
window.jQuery = window.$ = require('jquery');
var localstorage = window.localStorage;
var moment = require('moment');
var _ = require('lodash');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');

var defers = require('./promises/roomReservation.js');

var now = moment().utc().valueOf();

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
      Backbone.history.navigate('calendar/2/' + now + '/agendaWeek', {trigger: true});
      return;
    }

    resApp.roomRegion.$el.hide();
    resApp.mainRegion.show(new views.LoginView());
  },

  register: function() {
    if(document.cookie) {
      Backbone.history.navigate('calendar/2/' + now + '/agendaWeek', {trigger: true});
      return;
    }

    resApp.roomRegion.$el.hide();
    resApp.mainRegion.show(new views.RegisterView());
  },

  calendar: function(roomId, start, calendarView) {
    if(!document.cookie) {
      Backbone.history.navigate('', {trigger: true});
      return;
    }

    if(roomId === '1') {
      defers.defRoomOne.promise
      .then(function(collection1) {
        resApp.mainRegion.show(new views.CalendarView({
          collection: collection1,
          roomId: roomId,
          start: start,
          calendarView: calendarView
        }));
      });
    }

    if(roomId === '2') {
      defers.defRoomTwo.promise
      .then(function(collection2) {
        resApp.mainRegion.show(new views.CalendarView({
          collection: collection2,
          roomId: roomId,
          start: start,
          calendarView: calendarView
        }));
      });
    }

    views.roomsView.getRoomId(roomId, start, calendarView);
    resApp.roomRegion.$el.show();
    resApp.roomRegion.show(views.roomsView);
  },

  userReservationDetails: function(roomId, id, calendarView) {
    if(!document.cookie) {
      Backbone.history.navigate('', {trigger: true});
      return;
    }

    var collection;
    if(roomId === '1') {
      collection = models.roomOneReservations;
    }

    if(roomId === '2')
      collection = models.roomTwoReservations;

    resApp.roomRegion.$el.hide();

    resApp.mainRegion.show(new views.UserReservationView({
      collection: collection,
      reservationId: id,
      calendarView: calendarView
    }));
  },

  reservationDetails: function(roomId, id, calendarView) {
    if(!document.cookie) {
      Backbone.history.navigate('', {trigger: true});
      return;
    }

    resApp.roomRegion.$el.hide();

    var reservation = new models.SingleReservation({id: parseInt(id, 10)});

    reservation.fetch({
      success: function(model, response) {
        resApp.mainRegion.show(new views.ReservationView({
          model: model,
          calendarView: calendarView
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

  userDetails: function (roomId, dateNumber, calendarView) {
    if(!document.cookie) {
      Backbone.history.navigate('', {trigger: true});
      return;
    }

    resApp.roomRegion.$el.hide();

    resApp.mainRegion.show(new views.UserDetailsView({
      model: models.user,
      roomId: roomId,
      dateNumber: dateNumber,
      calendarView: calendarView
    }));
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
    'calendar/:roomId/:start/:calendarView': 'calendar',
    'userReservationDetails/:roomId/:id/:calendarView': 'userReservationDetails',
    'reservationDetails/:roomId/:id/:calendarView': 'reservationDetails',
    'confirm/:id': 'confirmRegistration',
    'userDetails/:roomId/:dateNumber/:calendarView': 'userDetails',
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
