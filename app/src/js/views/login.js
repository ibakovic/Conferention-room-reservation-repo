'use strict';

var _ = require('lodash');
var Backbone = require('backbone');
var popsicle = require('popsicle');
var Marionette = require('backbone.marionette');
var models = require('../models/models.js');
var Validate = require('./validation.js');
var loginTemplate = require('../../templates/login.html');
var noty = require('noty');
var moment = require('moment');
var format = require('string-template');
var deffers = require('../promises/roomReservation.js');
var q = require('q');

//console.log(loginTemplate);

var LoginView = Validate.extend({
  template: loginTemplate,

  ui: {
    username: '#loginUsername',
    password: '#loginPassword'
  },

  events: {
    'click #loginSubmit': 'loginSubmit',
    'click #signUp': 'signUp'
  },

  loginSubmit: function() {
    var username = this.ui.username.val().trim();
    var password = this.ui.password.val().trim();

    if(!this.validate(this.ui)) {
      return;
    }

    popsicle.request({
      method: 'POST',
      url: 'login',
      body: {
        username: username,
        password: password
      }
    })
    .then(function LoginSent(res) {
      if(!res.body.success) {
        noty({
          text: res.body.msg,
          layout: 'center',
          type: 'error',
          timeout: 2500
        });
        return;
      }

      window.localStorage.setItem('userId', res.body.userId);
      /*var x = models.rooms.fetch()
      .then(function(col){
        console.log(col);
        return models.reservations.fetch();
      })
      .then(function(col2){
        console.log(col2);
      });*/
      /*Promise.join(
        models.rooms.fetch({reset: true}),
        models.reservations.fetch(),
        models.user.fetch())
      .spread(function(d1, d2, d3) {
        console.log(d1, d2, d3);
      });*/

      /*Promise.join(models.rooms.fetch({reset: true}), models.reservations.fetch(),
        function(data1, data2){
          console.log('all rooms:', data1, 'All reservations:', data2);
          var x = 45;
          return x;
        }).then(function(data) {
          console.log(data);
        });*/

      models.rooms.fetch({reset: true});
      //models.reservations.fetch();
      models.user.fetch();

      models.roomOneReservations.fetch({
        success: function(collection, response) {
          deffers.defRoomOne.resolve(collection);
        }
      });

      models.roomTwoReservations.fetch({
        success: function(collection, response) {
          deffers.defRoomTwo.resolve(collection);
        }
      });

      noty({
          text: res.body.msg,
          layout: 'center',
          type: 'success',
          timeout: 2500
        });

      var now = moment().utc().valueOf();

      var calendarLink = format('calendar/2/{now}/agendaWeek', {
        now: now
      });

      Backbone.history.navigate(calendarLink, {trigger: true});
    })
    .catch(function loginErr(err) {
      noty({
        text: err.message,
        layout: 'center',
        type: 'error',
        timeout: 2500
      });
    });
  },

  signUp: function() {
    Backbone.history.navigate('register', {trigger: true});
  }
});

module.exports = LoginView;
