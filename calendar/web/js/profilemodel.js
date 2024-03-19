import { ajax } from './ajax.js';
import { Ics } from './ics.js';

function ProfileModel(storage) {
    this.storage = storage;
    this.availableCalendars = {};
    this.activeCalendars = {};
    this.storage.addProfileListener(this);
    if (this.amSignedIn()) {
        this.loadAvailableCalendars();
    }
}

ProfileModel.prototype.addVisual = function(vis) {
    this.vis = vis;
}

ProfileModel.prototype.amSignedIn = function() {
    return this.storage.hasToken();
}

ProfileModel.prototype.signedIn = function() {
    this.loadAvailableCalendars();
}

ProfileModel.prototype.signedOut = function() {
    this.availableCalendars = {};
}

ProfileModel.prototype.loadAvailableCalendars = function() {
    var opts = {};
    opts['x-identity-token'] = this.storage.getToken();
    ajax("/ajax/load-calendars.php", (stat, msg) => this.calendarsLoaded(stat, msg), null, null, opts);
}

ProfileModel.prototype.calendarsLoaded = function(stat, msg) {
    console.log(stat, msg, this.vis);
    if (stat == 200) {
        var info = JSON.parse(msg);
        for (var i=0;i<info.calendars.length;i++) {
            if (!Object.keys(this.availableCalendars).includes(info.calendars[i])) {
                this.availableCalendars[info.calendars[i]] = false;
            }
        }
        this.vis.updateCalendarList(this.availableCalendars);
    }
}

ProfileModel.prototype.selectCalendar = function(label, selected) {
    console.log("select", label, "as", selected);

    this.availableCalendars[label] = selected;

    if (selected) {
        // so the next step is to retrieve and parse this
        // I think we want to retrieve it every time we select it to allow for updates
        var opts = {};
        opts['x-identity-token'] = this.storage.getToken();
        opts['x-calendar-name'] = label;
        ajax("/ajax/retrieve-calendar.php", (stat, msg) => this.parseCalendar(label, stat, msg), null, null, opts);
    
    } else {
        // clear out the parsed version of the calendar (if any)
        delete this.activeCalendars[label]; // if it has been loaded and parsed
    }

    // and then somewhere else this model needs to be taken into account for redraw
}

ProfileModel.prototype.parseCalendar = function(label, stat, msg) {
    if (!this.availableCalendars[label]) {
        // I am considering this a race condition where the checkbox has been toggled on and off again before we can retrieve the calendar by ajax
        // so we want to ignore this "belated" response
        return;
    }

    if (stat != 200) {
        console.log("ajax calendar request for", label, "failed:", stat, msg);
        return;
    }

    var events;
    if (label.endsWith(".ics")) {
        events = Ics.parse(msg);
    } else {
        console.log("do not know how to parse", label);
        return;
    }
    if (events) {
        this.activeCalendars[label] = events;
    }

    this.vis.modelChanged();
}

export { ProfileModel };