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
var q = require('q');
var noty = require('noty');

var EventView = Marionette.ItemView.extend({
  render: function() {
    var self = this;
    this.$el.unwrap();

    this.parent.getCalendar()
      .then(function calendarCatched(element) {
        self.addEvent(element);
      })
      .catch(function calendarError(error) {
        noty({
          text: error,
          layout: 'center',
          type: 'error',
          timeout: 3000
        });
      });
  },

  addEvent: function(element) {
    if(this.model.get('roomId') === this.parent.roomId)
      $('#calendar').fullCalendar('renderEvent', this.model.attributes, true);
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

  events: {
    'click #logout': 'logout'
  },

  initialize: function(options) {
    this.roomId = parseInt(options.roomId, 10);
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
    var $calendar = this.$el.find('#calendar');

    function changeReservationStartAndEnd(changeEvent, revertFunc) {
      var changes = {
        start: changeEvent._start._d,
        end: changeEvent._end._d
      };

      var reservation = self.collection.findWhere({id: changeEvent.id});

      reservation.save(changes, {
        wait: true,
        success: function(model, response) {
          noty({
            text: response.msg,
            layout: 'center',
            type: 'success',
            timeout: 3000
          });
        },
        error: function(model, response) {
          noty({
            text: response.responseJSON.msg,
            layout: 'center',
            type: 'error',
            timeout: 3000
          });
          revertFunc();
        }
      });
    }

    $calendar.fullCalendar({
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'month,agendaWeek,agendaDay'
      },

      defaultDate: moment().utc().valueOf(),
      defaultView: 'agendaWeek',
      firstDay: 1,
      fixedWeekCount: false,
      selectOverlap: false,
      eventOverlap: false,
      slotLabelFormat: 'H:mm',
      selectable: true,
      selectHelper: true,
      timezone: 'UTC',

      select: function(start, end) {
        if(moment(end._d).diff(start._d, 'minutes') > 180) {
          noty({
            text: 'Time limit on a single reservation is 3h!',
            layout: 'center',
            type: 'error',
            timeout: 3000
          });
          $calendar.fullCalendar('unselect');
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
              timeout: 3000
            });
          }});
        }
        $calendar.fullCalendar('unselect');
      },

      editable: true,
      eventLimit: true,

      eventRender: function(event, element) {
        if(event.userId !== parseInt(window.localStorage.getItem('userId'), 10)) {
          element.css('opacity', '0.55');
          element.css('border-style', 'none');
        }
      },

      eventClick: function(clickEvent) {
        if(clickEvent.userId === parseInt(window.localStorage.getItem('userId'))) {
          Backbone.history.navigate('userReservationDetails/' + clickEvent.id, {trigger: true});
          return;
        }

        Backbone.history.navigate('reservationDetails/' + clickEvent.id, {trigger:true});
      },

      eventResize: function(resizeEvent, delta, revertFunc) {
        changeReservationStartAndEnd(resizeEvent, revertFunc);
      },

      eventDrop: function(dragEvent, delta, revertFunc) {
        changeReservationStartAndEnd(dragEvent, revertFunc);
      }
    });
    this.calendarPromise.resolve($calendar);
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
        timeout: 3000
      });
      Backbone.history.navigate('', {trigger: true});
    })
    .catch(function loggoutErr(err) {
      noty({
        text: err.body.msg,
        layout: 'center',
        type: 'error',
        timeout: 3000
      });
    });
  }
});

module.exports = CalendarView;
