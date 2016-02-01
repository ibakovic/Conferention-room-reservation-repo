'use strict';

var $ = require('jquery');
var _ = require('lodash');
var popsicle = require('popsicle');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
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

	createCalendar: function() {
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

				select: function(start, end) {
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
					console.log(clickEvent);
					alert('Change title and delete reservations');
				},

				eventResizeStop: function(resizeEvent) {
					//idReservations
					changeReservationStartAndEnd(resizeEvent);
					//alert('Event resized');
				},

				eventDragStop: function(dragEvent) {
					console.log('dragEvent');
					changeReservationStartAndEnd(dragEvent);
					//alert('Event dragged');
				}
			});
		});	
	}
});

module.exports = CalendarView;
