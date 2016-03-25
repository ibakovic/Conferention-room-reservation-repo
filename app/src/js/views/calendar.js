'use strict';

var $ = require('jquery');
var _ = require('lodash');
var popsicle = require('popsicle');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var moment = require('moment');
var fullCalendar = require('fullcalendar');
var calendarTemplate = require('../../templates/calendar.hbs');
var q = require('q');
var noty = require('../lib/alert.js');
var notyPrompt = require('noty');
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
      noty( error, 'error', 2500);
    });
  },

  showEvent: function($calendar) {
    var renderEventOptions = this.model.attributes;
    renderEventOptions.editable = false;

    if(this.model.get('userId') === this.parent.userIdLocalStorage) {
      renderEventOptions.editable = true;
    }

    if (window.localStorage.getItem('isAdmin') === 'true') {
      renderEventOptions.editable = true;
    }

    $calendar.fullCalendar('renderEvent', this.model.attributes, true);

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

  calendarPromise: null,

  userIdLocalStorage: 0,

  ui: {
    $calendar: '#calendar',
    btnUserDetails: '#userDetailsRedirect',
    btnLogout: '#logout'
  },

  events: {
    'click @ui.btnUserDetails': 'userDetails',
    'click @ui.btnLogout': 'logout'
  },

  addEventSuccess: function(model, response) {
    //Preuzimam model iz baze samo zbog id-a
    this.collection.push(model.get('data'));

    noty(response.msg, 'success', 2500);
  },

  changeReservationStartAndEnd: function(changeEvent, revertFunc) {
    var self =this;

    var changes = {
      roomId: self.roomId,
      start: changeEvent._start._d,
      end: changeEvent._end._d
    };

    var reservation = this.collection.findWhere({id: changeEvent.id});

    reservation.save(changes, {
      wait: true,
      success: function(model, response) {
        noty(response.msg, 'success', 2500);
      },
      error: function(model, response) {
        noty('Unauthorized to change this event!', 'error', 2500);
        revertFunc();
      }
    });
  },

  select: function(start, end) {
    if(window.localStorage.getItem('monthView') === 'true') {
      window.localStorage.setItem('monthView', false);
      return;
    }

    var self = this;
    if(moment(end._d).diff(start._d, 'minutes') > 180) {
      noty('Time limit on a single reservation is 3h!', 'error', 2500);
      this.ui.$calendar.fullCalendar('unselect');
      return;
    }

    function promptYes($noty) {
      var title = $('#promptInput').val().trim();

      var eventData;
      if (title) {
        eventData = {
          title: title,
          start: start,
          end: end,
          roomId: self.roomId
        };

        var newEvent = new self.collection.model(eventData);

        newEvent.save(null, {
          success: self.addEventSuccess.bind(self),
          error: function(error) {
            console.log(error);
          }
        });
      }
      self.ui.$calendar.fullCalendar('unselect');

      $noty.close();
    }

    notyPrompt({
      layout: 'topLeft',
      type: 'success',
      template: 'Event title:<br><input type="text" id="promptInput">',
      buttons: [{
        addClass: 'btn btn-success',
        text: 'Yes',
        onClick: promptYes
      }, {
        addClass: 'btn btn-danger',
        text: 'No',
        onClick: function promptNo($noty) {
          self.ui.$calendar.fullCalendar('unselect');
          $noty.close();
        }
      }],
      callback: {
        afterShow: function() {
          $('#promptInput').focus();
        }
      }
    });
  },

  renderEvent: function(event, element) {
    var self = this;

    if(event.userId !== this.userIdLocalStorage && (window.localStorage.getItem('isAdmin') !== 'true')) {
      element.css('opacity', '0.55');
      element.css('border-style', 'none');
    }

    if(event.id === parseInt(window.localStorage.getItem('reservationId'), 10)) {
      element.fadeIn('slow');
    }
  },

  clickEvent: function(clickEvent) {
    var userResDetLink = '';
    if(clickEvent.userId === this.userIdLocalStorage || (window.localStorage.getItem('isAdmin') === 'true')) {
      userResDetLink = format('userReservationDetails/{roomId}/{id}', {
        roomId: this.roomId,
        id: clickEvent.id
      });

      Backbone.history.navigate(userResDetLink, {trigger: true});
      return;
    }

    userResDetLink = format('reservationDetails/{roomId}/{id}', {
      roomId: this.roomId,
      id: clickEvent.id
    });

    Backbone.history.navigate(userResDetLink, {trigger:true});
  },

  initialize: function(options) {
    this.roomId = parseInt(options.roomId, 10);
    this.start = parseInt(options.start, 10);
    this.calendarView = options.calendarView;

    window.localStorage.setItem('calendarView', options.calendarView);
    window.localStorage.setItem('start', options.start);

    this.userIdLocalStorage = parseInt(window.localStorage.getItem('userId'), 10);

    this.calendarPromise = q.defer();
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
      unselectAuto: false,
      selectOverlap: false,
      eventOverlap: false,
      slotLabelFormat: 'H:mm',
      selectable: true,
      selectHelper: true,
      timezone: 'UTC',

      select: self.select.bind(self),

      editable: true,
      eventLimit: true,

      eventRender: self.renderEvent.bind(self),

      eventClick: self.clickEvent.bind(self),

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
      },

      dayClick: function(date, event, view) {
        if(view.type === 'month') {
          window.localStorage.setItem('monthView', true);
          self.ui.$calendar.fullCalendar('gotoDate', date);
          self.ui.$calendar.fullCalendar('changeView', "agendaDay");
        }
      }
    });

    this.calendarPromise.resolve(self.ui.$calendar);
  }
});

module.exports = CalendarView;
