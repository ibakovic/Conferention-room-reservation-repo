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
    console.log(res.body.msg);
    if(!res.body.success) {}
  })
  .catch(function resizeError(err) {
    alert(err.body.msg);
  });
}

var EventView = Marionette.ItemView.extend({
  render: function() {
    var self = this;

    this.parent.getCalendar()
      .then(function calendarCatched(element) {
        self.addEvent(element);
      })
      .catch(function calendarError(error) {
        console.log(error);
      });
  },

  addEvent: function(element) {
    if(this.model.get('roomId') === parseInt(roomId, 10))
      element.prevObject.find('#calendar').fullCalendar('renderEvent', this.model.attributes, true);
  }
  /*,

  destroy: function() {
    //remove full calendar element
  }*/
});

var CalendarView = Marionette.CollectionView.extend({
  childView: EventView,

  template: calendarTemplate,

  calendarPromise: q.defer(),

  events: {
    'click #logout': 'logout'
  },

  onBeforeAddChild: function(childView) {
    childView.parent = this;
  },

  getRoomId: function(newRoomId) {
    roomId = newRoomId;
  },

  getCalendar: function(calendarElement) {
    return this.calendarPromise.promise;
  },

  onDomRefresh: function() {
    this.createCalendar();
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
            roomId: parseInt(roomId, 10)
          };

          var newEvent = new self.collection.model(eventData);

          newEvent.save(null, {success: function(model, response) {
            //Preuzimam model iz baze samo zbog id-a
            self.collection.push(model.get('data'));

            alert(response.msg);
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

    if(this.collection.length !== 0)
      this.calendarPromise.resolve($calendar);
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
