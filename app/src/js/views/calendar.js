'use strict';

var $ = require('jquery');
var _ = require('lodash');
var popsicle = require('popsicle');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var moment = require('moment');
var fullCalendar = require('fullcalendar');
var calendarTemplate = require('../../templates/calendar.html');
var q = require('q');
var noty = require('noty');
var format = require('string-template');

var EventView = Marionette.ItemView.extend({
  render: function() {
    var self = this;
    this.$el.unwrap();

    this.parent.getCalendar()
      .then(function calendarCatched($calendar) {
        self.showEvent($calendar);
      })
      .catch(function calendarError(error) {
        noty({
          text: error,
          layout: 'center',
          type: 'error',
          timeout: 2500
        });
      });
  },

  showEvent: function($calendar) {
    this.parent.ui.$calendar.fullCalendar('renderEvent', this.model.attributes, true);

    this.$el.remove();
  }
  /*,

  destroy: function() {
    //remove full calendar element
  }*/
});

var CalendarView = Marionette.CompositeView.extend({
  childView: EventView,

  template: calendarTemplate,

  tagName: 'div',

  roomId: 0,

  calendarPromise: q.defer(),

  ui: {
    $calendar: '#calendar'
  },

  events: {
    'click #userDetailsRedirect': 'userDetails',
    'click #logout': 'logout'
  },

  changeReservationStartAndEnd: function(changeEvent, revertFunc) {
    var changes = {
      start: changeEvent._start._d,
      end: changeEvent._end._d
    };

    var reservation = this.collection.findWhere({id: changeEvent.id});

    reservation.save(changes, {
      wait: true,
      success: function(model, response) {
        noty({
          text: response.msg,
          layout: 'center',
          type: 'success',
          timeout: 2500
        });
      },
      error: function(model, response) {
        noty({
          text: 'Unauthorized to change this event!',
          layout: 'center',
          type: 'error',
          timeout: 2500
        });
        revertFunc();
      }
    });
  },

  select: function(start, end) {
    var self = this;
    if(moment(end._d).diff(start._d, 'minutes') > 180) {
      noty({
        text: 'Time limit on a single reservation is 3h!',
        layout: 'center',
        type: 'error',
        timeout: 2500
      });
      $('#calendar').fullCalendar('unselect');
      return;
    }

    var title = prompt('Event Title:');
    var eventData;
    if (title) {
      eventData = {
        title: title,
        start: start,
        end: end,
        roomId: self.roomId
      };

      var newEvent = new self.collection.model(eventData);

      newEvent.save(null, {success: function(model, response) {
        //Preuzimam model iz baze samo zbog id-a
        self.collection.push(model.get('data'));

        noty({
          text: response.msg,
          layout: 'center',
          type: 'success',
          timeout: 2500
        });
      }});
    }
    $('#calendar').fullCalendar('unselect');
  },

  initialize: function(options) {
    this.roomId = parseInt(options.roomId, 10);
    this.start = parseInt(options.start, 10);
    this.calendarView = options.calendarView;
  },

  onBeforeAddChild: function(childView) {
    childView.parent = this;
  },

  getCalendar: function(calendarElement) {
    return this.calendarPromise.promise;
  },

  onDomRefresh: function() {
    this.createCalendar();
  },

  createCalendar: function() {
    var self = this;
    var $calendar = this.ui.$calendar;

    $calendar.fullCalendar({
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'month,agendaWeek,agendaDay'
      },

      defaultDate: self.start,
      defaultView: self.calendarView,
      firstDay: 1,
      allDaySlot: false,
      fixedWeekCount: false,
      selectOverlap: false,
      eventOverlap: false,
      slotLabelFormat: 'H:mm',
      selectable: true,
      selectHelper: true,
      timezone: 'UTC',

      select: self.select.bind(self),

      editable: true,
      eventLimit: true,

      eventRender: function(event, element) {
        if(event.userId !== parseInt(window.localStorage.getItem('userId'), 10)) {
          element.css('opacity', '0.55');
          element.css('border-style', 'none');
        }
      },

      eventClick: function(clickEvent) {
        var userResDetLink = '';
        if(clickEvent.userId === parseInt(window.localStorage.getItem('userId'))) {
          userResDetLink = format('userReservationDetails/{roomId}/{id}/{view}', {
            roomId: self.roomId,
            id: clickEvent.id,
            view: self.calendarView
          });

          Backbone.history.navigate(userResDetLink, {trigger: true});
          return;
        }

          userResDetLink = format('reservationDetails/{roomId}/{id}/{view}', {
            roomId: self.roomId,
            id: clickEvent.id,
            view: self.calendarView
          });

        Backbone.history.navigate(userResDetLink, {trigger:true});
      },

      eventResize: function(resizeEvent, delta, revertFunc) {
        self.changeReservationStartAndEnd(resizeEvent, revertFunc);
      },

      eventDrop: function(dragEvent, delta, revertFunc) {
        self.changeReservationStartAndEnd(dragEvent, revertFunc);
      },

      viewRender: function(view, element) {
        self.calendarView = view.type;
        self.start = moment($calendar.fullCalendar('getDate')).utc().valueOf();

        var calendarLink = format('calendar/{roomId}/{start}/{view}', {
          roomId: self.roomId,
          start: self.start,
          view: self.calendarView
        });

        Backbone.history.navigate(calendarLink, {trigger: true});
      }
    });

    this.calendarPromise.resolve($('#calendar'));
  },

  userDetails: function() {
    var userDetailsLink = format('userDetails/{roomId}/{start}/{view}', {
      roomId: this.roomId,
      start: this.start,
      view: this.calendarView
    });

    Backbone.history.navigate(userDetailsLink, {trigger: true});
  },

  logout: function() {
    popsicle.request({
      method: 'GET',
      url: 'logout'
    })
    .then(function loggedOut(res) {
      noty({
        text: 'Good bye!',
        layout: 'center',
        type: 'success',
        timeout: 2500
      });
      Backbone.history.navigate('', {trigger: true});
    })
    .catch(function loggoutErr(err) {
      noty({
        text: err.body.msg,
        layout: 'center',
        type: 'error',
        timeout: 2500
      });
    });
  }
});

module.exports = CalendarView;
