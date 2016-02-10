'use strict';

var $ = require('jquery');
var _ = require('lodash');
var popsicle = require('popsicle');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var moment = require('moment');
var fullCalendar = require('fullcalendar');
//var router = require('../router.js');
var DetailsView = require('./reservationDetails.js');
var calendarTemplate = require('../../templates/calendar.html');

var $calendarElement;

function changeReservationStartAndEnd(changeEvent) {
	var path = 'reservations/' + changeEvent.id;
	
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
		if(!res.body.success) {}
	})
	.catch(function resizeError(err) {
		alert(err.body.msg);
	});
}

var ChildCalendarView = Marionette.ItemView.extend({
	template: $('<div></div>'),

	ui: {
		calendar: '#calendar'
	},

	onDomRefresh: function() {
		console.log('Child view');
		var self = this;

		var reservation = {
			title: self.model.get('title'),
			start: self.model.get('start'),
			end: self.model.get('end'),
			id: self.model.get('id'),
			roomId: self.model.get('roomId')
		};

		this.ui.calendar.fullCalendar('renderEvent', reservation);
	}
});

var CalendarView = Marionette.CollectionView.extend({
	childView: ChildCalendarView,

	template: calendarTemplate,

	events: {
		'click #logout': 'logout'
	},
/*
	initialize: function() {
		this.createCalendar();
		this.listenTo(this.collection, 'reset', this.createCalendar);

		//this.roomId = options.roomId;
	},
*/
	onDomRefresh: function() {
		var html = this.template();
		this.$el.html(html);
		var self = this;
		var roomId = this.collection.models[0].get('roomId');
		
		var $calendar = this.$el.find('#calendar');
		$calendarElement = $calendar;

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
						url: 'rooms/' + roomId,
						body: {
							title: eventData.title,
							start: eventData.start._d,
							end: eventData.end._d
						}
					})
					.then(function reservationSuccess(res) {
						alert(res.body.msg);
						return null;
					});
				}
			},

			editable: true,
			eventLimit: true, // allow "more" link when too many events
			/*events: _.map(this.collection.models, function(model) {
				return model.attributes;
			}),*/
			
			eventClick: function(clickEvent) {
				var model = self.collection.findWhere({id: clickEvent.id});
				var eventData = {
					title: model.get('title'),
					id: model.get('id'),
					roomId: model.get('roomId'),
					start: model.get('start'),
					end: model.get('end')
				};
				//Backbone.Events.trigger('getReservationData', eventData);
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
