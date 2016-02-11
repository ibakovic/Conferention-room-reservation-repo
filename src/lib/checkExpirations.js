'use strict';

var moment = require('moment');
var Temp = require('../models/models.js').Temp;

module.exports = setInterval(function() {
  Temp.fetchAll()
  .then(function(temps) {
    var now = moment()._d;
    console.log('Now:', now);

    temps.models.forEach(function(temp) {
      if(temp.attributes.expiration) {
        var timeDifference = moment(now).diff(temp.attributes.expiration, 'minutes');
        if(timeDifference > 0) {
          temp.destroy();
          console.log('Row deleted!');
        }
      }
    });
  })
  .catch(function(err) {
    console.log(err);
  });
}, 15*60*1000);
