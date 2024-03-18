import { ajax } from './ajax.js';

function ProfileModel(storage) {
    this.storage = storage;
    this.availableCalendars = {};
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
}

export { ProfileModel };