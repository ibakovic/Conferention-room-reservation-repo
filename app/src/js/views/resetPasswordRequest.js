'use strict';

var $ = require('jquery');
var noty = require('../lib/alert.js');
var popsicle = require('popsicle');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var Validation = require('./validation.js');
var rprTemplate = require('../../templates/resetPasswordRequest.hbs');

var rprView = Validation.extend({
  template: rprTemplate,

  ui: {
    username: '#rprUsername',
    btnResetPassword: '#resetPasswordRequest',
    btnCancel: '#rprCancel'
  },

  events: {
    'click @ui.btnResetPassword': 'resetPasswordRequest',
    'click @ui.btnCancel': 'cancel'
  },

  onShow: function() {
    this.ui.username.focus();
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
      noty(response.body.msg, 'success', 4000);
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
