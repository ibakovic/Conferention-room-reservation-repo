'use strict';

var $ = require('jquery');
var noty = require('noty');
var popsicle = require('popsicle');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var Validation = require('./validation.js');
var rprTemplate = require('../../templates/resetPasswordRequest.html');

var rprView = Validation.extend({
  template: rprTemplate,

  ui: {
    username: '#rprUsername'
  },

  events: {
    'click #resetPasswordRequest': 'resetPasswordRequest',
    'click #rprCancel': 'cancel'
  },

  resetPasswordRequest: function() {
    var self = this;

    if(!this.validate(this.ui)) {
      return;
    }

    popsicle.request({
      method: 'POST',
      url: 'resetMail',
      body: {
        userStringId: self.ui.username.val().trim()
      }
    })
    .then(function resetPasswordRequestSuccess(response) {
      console.log(response);
      noty({
        text: response.body.msg,
        layout: 'center',
        type: 'success',
        timeout: 4000
      });

      Backbone.history.navigate('', {trigger: true});
    })
    .catch(function resetPasswordRequestFailure(error) {
      console.log(error);
    });
  },

  cancel: function() {
    Backbone.history.navigate('', {trigger: true});
  }
});

module.exports = rprView;
