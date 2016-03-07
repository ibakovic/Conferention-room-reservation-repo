'use strict';

var $ = require('jquery');
window.jQuery = window.$ = require('jquery');
var localstorage = window.localStorage;
var moment = require('moment');
var _ = require('lodash');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var noty = require('noty');
var q = require('q');
var defer = require('./promises/roomReservation.js');

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

  calendar: function(roomId, start, eventView) {
    if(!document.cookie) {
      Backbone.history.navigate('', {trigger: true});
      return;
    }

    views.roomsView.getRoomId(roomId, start, eventView);
    resApp.roomRegion.$el.show();
    resApp.roomRegion.show(views.roomsView);

    var firstCollection;
    var secondCollection;

    if(window.localStorage.getItem('fetchCollection') === 'roomOneReservations') {
      firstCollection = models.roomOneReservations;
      secondCollection = models.roomTwoReservations;
    }

    if(window.localStorage.getItem('fetchCollection') === 'roomTwoReservations') {
      firstCollection = models.roomTwoReservations;
      secondCollection = models.roomOneReservations;
    }

    if((firstCollection.length !== 0) && (secondCollection.length !== 0)) {
      defer = q.defer();
      defer.resolve(firstCollection);

      resApp.mainRegion.show(new views.CalendarView({
        collection: firstCollection,
        roomId: roomId,
        start: start,
        calendarView: eventView
      }));

      return;
    }

    firstCollection.fetch({
      success: function(collection1, response) {
        defer = q.defer();
        defer.resolve(collection1);
        resApp.mainRegion.show(new views.CalendarView({
          collection: collection1,
          roomId: roomId,
          start: start,
          calendarView: eventView
        }));

        var newRoomId = parseInt(roomId, 10) + 1;

        if(newRoomId % 2 === 0)
          newRoomId = 2;
        else
          newRoomId = 1;

        secondCollection.fetch();
      },
      error: function(error) {
        console.log(error);

         noty({
          text: 'Failed to load your data!',
          layout: 'center',
          type: 'error',
          timeout: 2500
        });
      }
    });
  },

  userReservationDetails: function(roomId, id, calendarView) {
    if(!document.cookie) {
      Backbone.history.navigate('', {trigger: true});
      return;
    }

    defer.promise
    .then(function(collection) {
      resApp.roomRegion.$el.hide();

      var reservation = collection.findWhere({id: parseInt(id, 10)});

      resApp.mainRegion.show(new views.UserReservationView({
        model: reservation,
        calendarView: calendarView
      }));
    })
    .catch(function(err) {
      console.log(err);
    });
  },

  reservationDetails: function(roomId, id, calendarView) {
    if(!document.cookie) {
      Backbone.history.navigate('', {trigger: true});
      return;
    }

    /*
      needs a model from the collection
     */

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

  resetPassword: function(urlId, md5) {
    resApp.roomRegion.$el.hide();
    resApp.mainRegion.show(new views.ResetPassword({
      urlId: urlId,
      md5: md5
    }), {preventDestroy: true});
  },

  resetPasswordRequest: function() {
    if(document.cookie) {
      Backbone.history.navigate('calendar/2/' + now + '/agendaWeek', {trigger: true});
      return;
    }

    resApp.roomRegion.$el.hide();
    resApp.mainRegion.show(new views.ResetPasswordRequest());
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
    'resetPassword/:urlId/:md5': 'resetPassword',
    'resetPasswordRequest': 'resetPasswordRequest'
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
