'use strict';

var $ = require('jquery');
var _ = require('lodash');
var popsicle = require('popsicle');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var moment = require('moment');
var fullCalendar = require('fullcalendar');
var DetailsView = require('./reservationDetails.js');
var calendarTemplate = require('../../templates/calendar.html');

var roomId;

function changeReservationStartAndEnd(changeEvent) {
	var path = 'reservations/' + changeEvent.id;
	
	popsicle.request({
		method: 'POST',
		url: path,
		body: {
			start: changeEvent._start._d,
			end: changeEvent._end._d
		}
	})
	.then(function resized(res) {
		console.log('resized!! ', res.body.msg);
		if(!res.body.success) {}
	})
	.catch(function resizeError(err) {
		alert(err.body.msg);
	});
}

var ChildCalendarView = Marionette.ItemView.extend({
	template: $('<div></div>'),

	addEvent: function() {
		var self = this;

		if(this.model.get('roomId') === parseInt(roomId, 10)) {
			var reservation = {
				title: self.model.get('title'),
				start: self.model.get('start'),
				end: self.model.get('end'),
				id: self.model.get('id'),
				roomId: self.model.get('roomId')
			};

			$('#calendar').fullCalendar('renderEvent', reservation);
		}
	}
});

var CalendarView = Marionette.CollectionView.extend({
	childView: ChildCalendarView,

	template: calendarTemplate,

	events: {
		'click #logout': 'logout'
	},

	getRoomId: function(newRoomId) {
		roomId = newRoomId;
	},

	onDomRefresh: function() {
		this.createCalendar();
		this.children.call("addEvent");
	},

	createCalendar: function() {
		var html = this.template();
		this.$el.html(html);
		var self = this;

		var $calendar = this.$el.find('#calendar');
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
			scrollTime: '07:00:00',

			select: function(start, end) {
				if(moment(end._d).diff(start._d, 'minutes') > 180) {
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
						url: 'reservations',
						body: {
							title: eventData.title,
							start: eventData.start._d,
							end: eventData.end._d,
							roomId: parseInt(roomId, 10)
						}
					})
					.then(function reservationSuccess(res) {
						alert(res.body.msg);
						return null;
					})
					.catch(function(res) {
						alert(res.body.msg);
					});
				}
			},

			editable: true,
			eventLimit: true,
			
			eventClick: function(clickEvent) {
				var model = self.collection.findWhere({id: clickEvent.id});
				Backbone.history.navigate('reservationDetails/' + model.get('id'), {trigger: true});
			},

			eventResizeStop: function(resizeEvent) {
				resizeEvent.changing = true;
			},

			eventDragStop: function(dragEvent) {
				changeReservationStartAndEnd(dragEvent);
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
	},

	logout: function() {
		popsicle.request({
			method: 'GET',
			url: 'logout'
		})
		.then(function loggedOut(res) {
			Backbone.history.navigate('', {trigger: true});
		})
		.catch(function loggoutErr(err) {
			console.log(err);
		});
	}
});

module.exports = CalendarView;
