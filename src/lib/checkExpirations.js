'use strict';

var Cron = require('cron').CronJob;
var moment = require('moment');
var User = require('../models/models.js').User;

var job = new Cron({
  cronTime: '* */15 * * * *',
  onTick: function() {
    var now = moment()._d;
    console.log(now);

    User.where('verificationId', '<>', 'null').fetchAll()
    .then(function usersFound(users) {
      users.forEach(function(user) {

        var timeDifference = moment(now).diff(user.get('createdAt'), 'minutes');

        if(timeDifference > 3) {
          user.destroy();
          console.log('User ' + user.get('username') + ' deleted');
        }
      });
    })
    .catch(function(err) {
      console.log('err');
    });
  },
  start: true
});

module.exports = job;
