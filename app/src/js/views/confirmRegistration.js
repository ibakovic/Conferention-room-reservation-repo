'use strict';

var $ = require('jquery');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var popsicle = require('popsicle');
var noty = require('../lib/alert.js');
var registrationConfirmTemplate = require('../../templates/confirmRegistration.hbs');

var ConfirmRegistration = Marionette.ItemView.extend({
  template: registrationConfirmTemplate,

  confirmId: '',

  ui: {
    btnReturn: '#returnToLogin'
  },

  events: {
    'click @ui.btnReturn': 'returnToLogin'
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
      noty(res.body.msg, 'success', 4500);

      if(res.body.success)
        Backbone.history.navigate('', {trigger: true});
    })
    .catch(function confirmationError(err) {
      noty(err, 'error', 2500);
    });
  }
});

module.exports = ConfirmRegistration;
