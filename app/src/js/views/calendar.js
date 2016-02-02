'use strict';

var $ = require('jquery');
var _ = require('lodash');
var popsicle = require('popsicle');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var router = require('../router.js');
var moment = require('moment');
var fullCalendar = require('fullcalendar');
var calendarTemplate = require('../../templates/calendar.html');

function changeReservationStartAndEnd(changeEvent) {
	var path = 'reservations/' + changeEvent.idReservations;

	popsicle.request({
		method: 'PUT',
		url: path,
		body: {
			start: changeEvent._start._d,
			end: changeEvent._end._d
		}
	})
	.then(function resized(res) {
		console.log('resized!! ', res.body.msg);
	})
	.catch(function resizeError(err) {
		alert(err.body.msg);
	});
}

var CalendarView = Marionette.ItemView.extend({
	template: calendarTemplate,

	initialize: function() {
		_.bindAll(this, 'createCalendar', 'show', 'hide');
	},

	createCalendar: function() {
		var html = this.template();
		this.$el.html(html);

		var $calendar = this.$el.find('#calendar');
		popsicle.request({
			method: 'GET',
			url: 'reservations/2'
		})
		.then(function reservationsGot(res) {
			$calendar.fullCalendar({
				header: {
					left: 'prev,next today',
					center: 'title',
					right: 'month,agendaWeek,agendaDay'
				},

				defaultDate: moment().utc().valueOf(),
				firstDay: 1,
				fixedWeekCount: false,
				selectOverlap: false,
				eventOverlap: false,
				slotLabelFormat: 'H:mm',
				selectable: true,
				selectHelper: true,
				timezone: 'UTC',
				//scrollTime: '07:00:00',

				select: function(start, end) {
					if(moment(end._d).diff(start._d, 'minutes') >= 180) {
						alert('Time limit on a single reservation is 3h!');
						return;
					}
					var title = prompt('Event Title:');
					var eventData;
					if (title) {
						eventData = {
							title: title,
							start: start,
							end: end
						};
						$calendar.fullCalendar('renderEvent', eventData, true); // stick? = true
					}
					$calendar.fullCalendar('unselect');
					/////////////////////////////////////////////Send data here
					if(eventData) {
						popsicle.request({
							method: 'POST',
							url: 'users/15/rooms/2',
							body: {
								title: eventData.title,
								start: eventData.start._d,
								end: eventData.end._d
							}
						})
						.then(function reservationSuccess(res) {
							alert(res.body.msg);
						});
					}
				},

				editable: true,
				eventLimit: true, // allow "more" link when too many events
				events: res.body.data,

				eventClick: function(clickEvent) {
					console.log('Event click');
					var eventData = {
						title: clickEvent.title,
						id: clickEvent.idReservations,
						roomId: clickEvent.roomId
					};
					Backbone.Events.trigger('getReservationData', eventData);
					router.navigate('reservationDetails', {trigger: true});
				},

				eventResizeStop: function(resizeEvent) {
					//changeReservationStartAndEnd(resizeEvent);
					resizeEvent.changing = true;
				},

				eventDragStop: function(dragEvent) {
					//changeReservationStartAndEnd(dragEvent);
					dragEvent.changing = true;
				},

				eventAfterRender: function(changeEvent, element, view ) {
					if(changeEvent.changing){
						if(moment(changeEvent._start._d).diff(changeEvent._end._d, 'minutes') >= -180) {
							changeReservationStartAndEnd(changeEvent);
							return;
						}
					}
				}
			});
		});	
	},

	show: function() {
		this.$el.show();
	},

	hide: function() {
		this.$el.hide();
	}
});

module.exports = CalendarView;
