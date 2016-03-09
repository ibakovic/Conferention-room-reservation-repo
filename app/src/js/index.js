'use strict';

var $ = require('jquery');
window.jQuery = window.$ = require('jquery');
var localstorage = window.localStorage;
var moment = require('moment');
var _ = require('lodash');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var noty = require('./lib/alert.js');
var q = require('q');
var defer = require('./promises/roomReservation.js');
var isLoggedIn = require('./lib/isLoggedIn.js');

var now = moment().utc().valueOf();
var firstCollection;
var secondCollection;

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
    if(isLoggedIn()) {
      Backbone.history.navigate('calendar/2/' + now + '/agendaWeek', {trigger: true});
      return;
    }

    resApp.roomRegion.empty();
    resApp.mainRegion.show(new views.LoginView());
  },

  register: function() {
    if(isLoggedIn()) {
      Backbone.history.navigate('calendar/2/' + now + '/agendaWeek', {trigger: true});
      return;
    }

    resApp.roomRegion.empty();
    resApp.mainRegion.show(new views.RegisterView());
  },

  calendar: function(roomId, start, eventView) {
    if(!isLoggedIn()) {
      Backbone.history.navigate('', {trigger: true});
      return;
    }

    //Avoid fetching rooms if possible
    if(models.rooms.length !== 0) {
      resApp.roomRegion.show(new views.RoomsView({
        collection: models.rooms,
        start: start,
        eventView: eventView
      }));
    }
    else {
      models.rooms.fetch({
        success: function roomsFetchSuccess(roomsCollection, response) {
          resApp.roomRegion.show(new views.RoomsView({
            collection: roomsCollection,
            start: start,
            eventView: eventView
          }));
        },
        error: function roomsFetchError(error) {
          console.log(error);
        }
      });
    }

    if(firstCollection && secondCollection && (firstCollection.length !== 0) && (secondCollection.length !== 0)) {
      var intRoomId = parseInt(roomId, 10);
      var collection;

      if(firstCollection.models[0].get('roomId') === intRoomId)
        collection = firstCollection;

      if(secondCollection.models[0].get('roomId') === intRoomId)
        collection = secondCollection;

      defer = q.defer();
      defer.resolve(collection);

      resApp.mainRegion.show(new views.CalendarView({
        collection: collection,
        roomId: roomId,
        start: start,
        calendarView: eventView
      }));

      return;
    }

    var Reservations = Backbone.Collection.extend({
      url: '/reservations/rooms/' + roomId,
      model: models.Reservation,
      parse: function(response) {
        return response.data;
      }
    });

    firstCollection = new Reservations();

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

        Reservations = Backbone.Collection.extend({
          url: '/reservations/rooms/' + newRoomId,
          model: models.Reservation,
          parse: function(response) {
            return response.data;
          }
        });

        secondCollection = new Reservations();

        secondCollection.fetch();
      },
      error: function(error) {
        console.log(error);

         noty('Failed to load your data!', 'error', 2500);
      }
    });
  },

  userReservationDetails: function(roomId, id, calendarView) {
    if(!isLoggedIn()) {
      Backbone.history.navigate('', {trigger: true});
      return;
    }

    defer.promise
    .then(function(collection) {
      resApp.roomRegion.empty();

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
    if(!isLoggedIn()) {
      Backbone.history.navigate('', {trigger: true});
      return;
    }

    /*
      needs a model from the collection
     */

    resApp.roomRegion.empty();

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
    resApp.roomRegion.empty();

    views.confirmRegistration.getId(id);
    resApp.mainRegion.show(views.confirmRegistration, {preventDestroy: true});
  },

  userDetails: function (roomId, dateNumber, calendarView) {
    if(!isLoggedIn()) {
      Backbone.history.navigate('', {trigger: true});
      return;
    }

    resApp.roomRegion.empty();

    models.user.fetch({
      success: function userFetchSuccess(user, response) {
        resApp.mainRegion.show(new views.UserDetailsView({
          model: user,
          roomId: roomId,
          dateNumber: dateNumber,
          calendarView: calendarView
        }));
      },
      error: function userFetchError(model, response) {
        console.log(response);
      }
    });
  },

  resetPassword: function(urlId, md5) {
    resApp.roomRegion.empty();
    resApp.mainRegion.show(new views.ResetPassword({
      urlId: urlId,
      md5: md5
    }), {preventDestroy: true});
  },

  resetPasswordRequest: function() {
    if(isLoggedIn()) {
      Backbone.history.navigate('calendar/2/' + now + '/agendaWeek', {trigger: true});
      return;
    }

    resApp.roomRegion.empty();
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
