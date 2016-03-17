'use strict';

var handlebars = require('handlebars');
var mailTemplate = require('../mail templates/mailTemplate.js');

module.exports = function(mailTitle, mailText, mailLink) {
  var template = handlebars.compile(mailTemplate);
  var templateData = {
    "mailTitle": mailTitle,
    "mailText": mailText,
    "mailLink": mailLink
  };

  return template(templateData);
};
