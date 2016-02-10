'use strict';
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

var knex = require('knex')({
  client: 'mysql',
  connection: {
    host: server_ip_address,
    user: 'ivanBakovic',
    password: '1v@nb@k0v1c',
    database: 'ConferenceRoomBooking',
    charset: 'utf8',
    timezone: 'UTC'
  }
});

var bookshelf = require('bookshelf')(knex);

var User = bookshelf.Model.extend({
  tableName: 'Users'
});

var Room = bookshelf.Model.extend({
	tableName: 'Rooms'
});

var Reservation = bookshelf.Model.extend({
	tableName: 'Reservations'
});

var Temp = bookshelf.Model.extend({
  tableName: 'Temp'
});

module.exports = {
	User: User,
	Room: Room,
	Reservation: Reservation,
  Temp: Temp
};