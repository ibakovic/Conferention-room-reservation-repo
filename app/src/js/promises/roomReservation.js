'use strict';

var q = require('q');

var defRoomOne = q.defer();
var defRoomTwo = q.defer();

module.exports = {
  defRoomOne: defRoomOne,
  defRoomTwo: defRoomTwo
};
