'use strict';

var Cron = require('cron').CronJob;
var moment = require('moment');
var message = require('../../strings.json');
var logger = require('minilog')('checkExpiration.js');
var User = require('../models/models.js').User;
var nodemailer = require('nodemailer');

function userDeletedMail (email) {
  var transporter = nodemailer.createTransport({
    host: 'mail.vip.hr'
  });

  var mailOptions = {
    from: 'noreply@extensionengine.com',
    to: email,
    subject: message.EmailSubjectUserDeleted,
    text: message.EmailTextUserDeleted
  };

  transporter.sendMail(mailOptions, function userDeletedEmail(err, info) {
    if (err) {
      logger.error('Error: ', err);
      return;
    }

    logger.log(info.response);
  });
}

var job = new Cron({
  cronTime: '*/15 */15 * * * *',
  onTick: function() {
    var now = moment()._d;
    logger.log(now);

    User.where('verificationId', '<>', 'null').fetchAll()
    .then(function usersFound(users) {
      users.forEach(function(user) {

        var timeDifference = moment(now).diff(user.get('createdAt'), 'minutes');

        if(timeDifference >= 1) {
          logger.warn('User about to be deleted!');
          user.destroy();

          logger.log('User ' + user.get('username') + ' deleted');
          //send e-mail
          userDeletedMail(user.get('email'));
        }
      });
    })
    .catch(function(err) {
      logger.error('err: ', err);
    });
  },
  start: true
});

module.exports = job;
