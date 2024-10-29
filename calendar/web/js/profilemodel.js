import { Ajax } from './ajax.js';
import { AutoWireStorage, ControllerOfType, StateElement } from './autowire.js';
import { CsvCalendar } from './csvcalendar.js';
import { CalEvent, ChangeTZ } from './events.js';
import { Ics } from './ics.js';
import { ModelProvider } from './model.js';
import { Profiles } from './profiles.js';

function ProfileModel() {
    this.storage = new AutoWireStorage();
    this.ajax = new ControllerOfType(Ajax);
    this.modelProvider = new ControllerOfType(ModelProvider);
    this.vis = new ControllerOfType(Profiles);
    this.drawerState = new StateElement("profile", "drawerState", false);
    this.availableCalendars = {};
    this.selectedCalendars = new StateElement("profile", "selectedCalendars", {});
    this.activeCalendars = {};
    this.calprops = new StateElement("profile", "calendarProps", {});
    this.calendarCategories = {};
    this.categoryConfigs = new StateElement("profile", "configs", {});
    this.savedPlans = [];
    this.events = [];
    this.timezoneChangesMap = {};
    this.timezoneChanges = [];
}

ProfileModel.prototype.init = function() {
    this.storage.addProfileListener(this);
    if (this.amSignedIn()) {
        this.loadAvailableCalendars();
    }
    if (this.drawerState.value()) {
        this.vis.openDrawer();
    }
    this.changeTimeZone(this.modelProvider.showTz.value);
    this.vis.modelChanged();
}

ProfileModel.prototype.reset = function() {
    this.drawerState.set(false);
    var acs = this.selectedCalendars.value();
    for (var c of Object.keys(acs)) {
        acs[c] = false;
    }
    this.activeCalendars = {};
    this.categoryConfigs.set({});
}

ProfileModel.prototype.amSignedIn = function() {
    return this.storage.hasToken();
}

ProfileModel.prototype.signedIn = function() {
    this.selectedCalendars.set({});
    this.availableCalendars = {};
    this.activeCalendars = {};
    this.calendarCategories = {};
    this.categoryConfigs.set({});
    this.loadAvailableCalendars();
    this.vis.modelChanged();
}

ProfileModel.prototype.signedOut = function() {
    this.drawerState.set(false);
    this.availableCalendars = {};
    this.selectedCalendars.set({});
    this.activeCalendars = {};
    this.calendarCategories = {};
    this.categoryConfigs.set({});
    this.modelProvider.reset();
    this.storage.clear();
    this.vis.modelChanged();
}

ProfileModel.prototype.drawerOpen = function(isOpen) {
    this.drawerState.set(isOpen);
}

ProfileModel.prototype.loadAvailableCalendars = function(andThen) {
    this.ajax.secureUri("/ajax/load-calendars.php")
        .invoke((stat, msg) => this.calendarsLoaded(stat, msg, andThen));
}

ProfileModel.prototype.calendarsLoaded = function(stat, msg, andThen) {
    if (stat == 200) {
        var info = JSON.parse(msg);
        this.savedPlans = [];
        var acs = this.selectedCalendars.value();
        var ks = Object.keys(acs);
        for (var k of ks) {
            if (!info.calendars.includes(k))
                delete acs[k];
        }
        for (var c of info.calendars) {
            if (c.endsWith(".caljs")) {
                this.savedPlans.push(c);
            } else {
                if (!ks.includes(c)) {
                    acs[c] = false;
                } else if (acs[c]) {
                    this.includeCalendar(c, true);
                }
    
            }
        }
        this.selectedCalendars.set(acs);
        this.savedPlans.sort();
        this.vis.modelChanged();
    }
    if (andThen) {
        andThen(stat, msg);
    }
}

ProfileModel.prototype.selectCalendarAction = function(label, selected) {
    this.selectedCalendars.value()[label] = selected;
    this.selectedCalendars.store();
    
    if (selected)
        this.includeCalendar(label);
    else
        this.removeCalendar(label);
}

ProfileModel.prototype.includeCalendar = function(label) {
    this.ajax.secureUri("/ajax/retrieve-calendar.php")
        .header('x-calendar-name', label)
        .invoke((stat, msg) => this.parseCalendar(label, stat, msg));
}

ProfileModel.prototype.removeCalendar = function(label) {
    // clear out the parsed version of the calendar (if any)
    delete this.activeCalendars[label]; // if it has been loaded and parsed
    delete this.calendarCategories[label];
    this.vis.modelChanged();
}

ProfileModel.prototype.changeTimeZone = function(tz, donotNotify) {
    if (tz)
        this.showTZ = tz;
    if (!this.showTZ)
        return;
    var acs = this.activeCalendars;
    var cals = Object.keys(acs);
    for (var i=0;i<cals.length;i++) {
        var cal = acs[cals[i]];
        CalEvent.retz(cal, this.showTZ, this.timezoneChanges);
    }
    if (!donotNotify)
        this.vis.modelChanged();
}

ProfileModel.prototype.parseCalendar = function(label, stat, msg) {
    if (!this.selectedCalendars.value()[label]) {
        // I am considering this a race condition where the checkbox has been toggled on and off again before we can retrieve the calendar by ajax
        // so we want to ignore this "belated" response
        return;
    }

    if (stat != 200) {
        console.log("ajax calendar request for", label, "failed:", stat, msg);
        return;
    }

    var events, timezones;
    var props = this.calprops[label];
    var ptz = props && props.tz;
    if (label.endsWith(".ics")) {
        events = Ics.parse(msg, ptz, this.modelProvider.showTz.value);
    } else if (label.endsWith(".csv") || "internal-calendar" == label) {
        var pair = CsvCalendar.parse(msg, ptz, this.modelProvider.showTz.value);
        events = pair.events;
        timezones = pair.timezones;
    } else {
        // TODO: support JSON
        console.log("do not know how to parse", label);
        return;
    }
    if (events) {
        this.activeCalendars[label] = events;
        var cats = new Set();
        for (var i=0;i<events.length;i++) {
            var ev = events[i];
            if (ev.category) {
                cats.add(ev.category);
            }
        }
        this.calendarCategories[label] = cats;
    }
    if (timezones) {
        // TODO: this needs to be able to be shared across calendars and remember which is which
        this.timezoneChangesMap[label] = timezones;
    } else {
        delete this.timezoneChangesMap[label];
    }
    this.mergeTZChanges();

    this.vis.modelChanged();
}

ProfileModel.prototype.mergeTZChanges = function() {
    this.timezoneChanges.splice(0, this.timezoneChanges.length);
    var cals = Object.keys(this.timezoneChangesMap);
    for (var c of cals) {
        var changes = this.timezoneChangesMap[c];
        for (var ch of changes) {
            this.timezoneChanges.push(ch);
        }
    }
    this.timezoneChanges.sort(ChangeTZ.comparator);
}

ProfileModel.prototype.loadPlan = function(plan) {
    this.ajax.secureUri("/ajax/retrieve-calendar.php")
        .header('x-calendar-name', plan)
        .invoke((stat, msg) => this.updateFromPlan(stat, msg));
}

ProfileModel.prototype.updateFromPlan = function(stat, msg) {
    if (stat != 200) {
        console.log("ajax calendar request to load plan failed:", stat, msg);
        return;
    }

    var plan = JSON.parse(msg);
    this.modelProvider.overridePlan(plan);
    this.vis.modelChanged();
}

ProfileModel.prototype.categories = function() {
    var ret = new Set();
    for (var k in this.calendarCategories) {
        var s = this.calendarCategories[k];
        for (var e of s) {
            ret.add(e);
        }
    }
    return Array.from(ret).sort();
}

ProfileModel.prototype.category = function(cat) {
    var ret = this.categoryConfigs.value()[cat];
    if (ret)
        return ret;
    return { color: "--" };
}

ProfileModel.prototype.chooseCategoryColor = function(cat, color) {
    this.categoryConfigs.setField(cat, { color });
    this.vis.modelChanged();
}

export { ProfileModel };