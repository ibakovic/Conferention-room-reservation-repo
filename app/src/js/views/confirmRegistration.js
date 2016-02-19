'use strict';

var $ = require('jquery');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var popsicle = require('popsicle');
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
      console.log(res);
      alert(res.body.msg);

      if(res.body.success)
        Backbone.history.navigate('', {trigger: true});
    })
    .catch(function confirmationError(err) {
      console.log(err);
    });
  }
});

module.exports = ConfirmRegistration;
