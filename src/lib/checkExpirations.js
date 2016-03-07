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

function expirationCheck(now, users, field, subject, text) {
  users.forEach(function(user) {
    var passwordResetDiff = moment(now).diff(user.get(field), 'minutes');

    var passwordResetSet = {
      resetPasswordId: null
    };

    if(passwordResetDiff >= 30) {
      if(field === 'resetPasswordCreatedAt')
        passwordResetSet.resetPasswordCreatedAt = null;

      if(field === 'createdAt')
        passwordResetSet.createdAt = null;

      user.save(passwordResetSet, {method: 'update'})
      .then(function(updatedUser) {
        logger.log('Time runned out!');

        userMail(updatedUser.get('email'), subject, text);
      })
      .catch(function(err) {
        logger.error(err);
      });
    }
  });
}

var job = new Cron({
  cronTime: '*/15 */15 * * * *',
  onTick: function() {
    var now = moment()._d;
    logger.log(now);

    User.where('resetPasswordCreatedAt', '<>', 'null').fetchAll()
    .then(function(users) {
      expirationCheck(now, users, 'resetPasswordCreatedAt', message.EmailSubjectResetPassword, message.EmailTextResetPasswordFail);
    })
    .catch(function(err) {
      logger.error('err: ', err);
    });

    User.where('verificationId', '<>', 'null').fetchAll()
    .then(function usersFound(users) {
      expirationCheck(now, users, 'createdAt', message.EmailSubjectUserDeleted, message.EmailTextUserDeleted);
    })
    .catch(function(err) {
      logger.error('err: ', err);
    });
  },
  start: true
});

module.exports = job;
