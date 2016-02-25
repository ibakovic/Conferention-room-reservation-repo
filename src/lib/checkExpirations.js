'use strict';

var Cron = require('cron').CronJob;
var moment = require('moment');
var message = require('../../strings.json');
var logger = require('minilog')('checkExpiration.js');
var User = require('../models/models.js').User;
var nodemailer = require('nodemailer');

function userMail (email, subject, text) {
  var transporter = nodemailer.createTransport({
    host: 'mail.vip.hr'
  });

  var mailOptions = {
    from: 'noreply@extensionengine.com',
    to: email,
    subject: subject,
    text: text
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

    User.where('resetPasswordCreatedAt', '<>', 'null').fetchAll()
    .then(function(users) {
      users.forEach(function(user) {
        var passwordResetDiff = moment(now).diff(user.get('resetPasswordCreatedAt'), 'minutes');

        if(passwordResetDiff >= 120) {
          var passwordResetSet = {
            resetPasswordCreatedAt: null,
            resetPasswordId: null
          };

          user.save(passwordResetSet, {method: 'update'})
          .then(function(updatedUser) {
            logger.log('Password reset failed!');

            userMail(updatedUser.get('email'), message.EmailSubjectResetPassword, message.EmailTextResetPasswordFail);
          })
          .catch(function(err) {
            logger.error(err);
          });
        }
      });
    })
    .catch(function(err) {
      logger.error('err: ', err);
    });

    User.where('verificationId', '<>', 'null').fetchAll()
    .then(function usersFound(users) {
      users.forEach(function(user) {

        var timeDifference = moment(now).diff(user.get('createdAt'), 'minutes');

        if(timeDifference >= 30) {
          logger.warn('User about to be deleted!');
          user.destroy();

          logger.log('User ' + user.get('username') + ' deleted');
          //send e-mail
          userMail(user.get('email'), message.EmailSubjectUserDeleted, message.EmailTextUserDeleted);
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
