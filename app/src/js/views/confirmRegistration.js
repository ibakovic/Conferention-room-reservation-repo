'use strict';

var $ = require('jquery');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var popsicle = require('popsicle');
var noty = require('noty');
var registrationConfirmTemplate = require('../../templates/confirmRegistration.html');

var ConfirmRegistration = Marionette.ItemView.extend({
  template: registrationConfirmTemplate,

  confirmId: '',

  events: {
    'click #returnToLogin': 'returnToLogin'
  },

  getId: function(id) {
    this.confirmId = id;
  },

  returnToLogin: function() {
    var self = this;

    popsicle.request({
      method: 'GET',
      url: 'confirm/' + self.confirmId
    })
    .then(function confirmationRequested(res) {
      noty({
        text: res.body.msg,
        layout: 'center',
        type: 'success',
        timeout: 3000
      });

      if(res.body.success)
        Backbone.history.navigate('', {trigger: true});
    })
    .catch(function confirmationError(err) {
      noty({
        text: err,
        layout: 'center',
        type: 'error',
        timeout: 3000
      });
    });
  }
});

module.exports = ConfirmRegistration;
