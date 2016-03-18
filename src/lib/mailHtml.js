'use strict';

var handlebars = require('handlebars');
var path = require('path');
var fs = require('fs');
var logger = require('minilog')('mailHtml.js');

var templatePath = path.join(__dirname, '../mail templates/mailTemplate.handlebars');

module.exports = function(mailTitle, mailText, mailLink) {
  var template = fs.readFileSync(templatePath, 'utf8');
  var htmlTemplate = handlebars.compile(template);
  var templateData = {
    "mailTitle": mailTitle,
    "mailText": mailText,
    "mailLink": mailLink
  };

  return htmlTemplate(templateData);
};
