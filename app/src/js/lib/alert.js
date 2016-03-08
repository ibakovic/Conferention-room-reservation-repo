'use strict';

var noty = require('noty');

module.exports = function alert(msg, type, timeout) {
  noty({
    text: msg,
    layout: 'center',
    type: type,
    timeout: timeout
  });
}
