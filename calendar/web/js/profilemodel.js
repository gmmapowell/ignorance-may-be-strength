import { ajax } from './ajax.js';
import { StateElement } from './autowire.js';
import { CsvCalendar } from './csvcalendar.js';
import { CalEvent, ChangeTZ } from './events.js';
import { Ics } from './ics.js';

function ProfileModel(storage) {
    this.storage = storage;
    this.drawerState = new StateElement("profile", "drawerState");
    this.availableCalendars = {};
    this.activeCalendars = {};
    this.calprops = {};
    this.calendarCategories = {};
    this.categoryConfigs = {};
    this.savedPlans = [];
    this.events = [];
    this.timezoneChangesMap = {};
    this.timezoneChanges = [];
    this.storage.addProfileListener(this);
    if (this.amSignedIn()) {
        this.loadAvailableCalendars();
    }
}

ProfileModel.prototype.addPlan = function(planner) {
    this.modelProvider = planner;
}

ProfileModel.prototype.addVisual = function(vis) {
    this.vis = vis;
    /*
    var state = this.storage.currentState("profile");
    if (state) {
        if (state.drawerState) {
            this.drawerState = true;
        }
        if (state.configs) {
            this.categoryConfigs = state.configs;
        }
        if (state.calendarProps) {
            this.calprops = state.calendarProps;
        }
        if (state.showtz) {
            this.showtz = state.showtz;
        }

        if (state.selectedCalendars) {
            for (var c of state.selectedCalendars) {
                this.includeCalendar(c, true);
            };
        }
    }
    */
    if (this.drawerState.value()) {
        vis.openDrawer();
    }
    vis.modelChanged();
}

ProfileModel.prototype.reset = function() {
    this.drawerState.set(false);
    for (var c of Object.keys(this.availableCalendars)) {
        this.availableCalendars[c] = false;
    }
    this.activeCalendars = {};
    this.categoryConfigs = {};
    this.storeCurrentState();
}

ProfileModel.prototype.amSignedIn = function() {
    return this.storage.hasToken();
}

ProfileModel.prototype.signedIn = function() {
    this.availableCalendars = {};
    this.loadAvailableCalendars();
    this.activeCalendars = {};
    this.calendarCategories = {};
    this.categoryConfigs = {};
    this.vis.modelChanged();
}

ProfileModel.prototype.signedOut = function() {
    this.availableCalendars = {};
    this.activeCalendars = {};
    this.calendarCategories = {};
    this.categoryConfigs = {};
    this.storage.clear();
    this.vis.modelChanged();
}

ProfileModel.prototype.drawerOpen = function(isOpen) {
    this.drawerState.set(isOpen);
}

ProfileModel.prototype.loadAvailableCalendars = function() {
    var opts = {};
    opts['x-identity-token'] = this.storage.getToken();
    ajax("/ajax/load-calendars.php", (stat, msg) => this.calendarsLoaded(stat, msg), null, null, null, opts);
}

ProfileModel.prototype.calendarsLoaded = function(stat, msg) {
    if (stat == 200) {
        var info = JSON.parse(msg);
        this.savedPlans = [];
        for (var c of info.calendars) {
            if (c.endsWith(".caljs")) {
                console.log('have a saved plan', c);
                this.savedPlans.push(c);
            } else {
                if (!Object.keys(this.availableCalendars).includes(c)) {
                    this.availableCalendars[c] = false;
                }
            }
        }
        this.savedPlans.sort();
        this.vis.modelChanged();
    }
}

ProfileModel.prototype.selectCalendarAction = function(label, selected) {
    this.availableCalendars[label] = selected;
    this.storeCurrentState();
    
    if (selected)
        this.includeCalendar(label);
    else
        this.removeCalendar(label);
}

ProfileModel.prototype.includeCalendar = function(label) {
    // so the next step is to retrieve and parse this
    // I think we want to retrieve it every time we select it to allow for updates
    var opts = {};
    opts['x-identity-token'] = this.storage.getToken();
    opts['x-calendar-name'] = label;
    ajax("/ajax/retrieve-calendar.php", (stat, msg) => this.parseCalendar(label, stat, msg), null, null, null, opts);
    // and then somewhere else this model needs to be taken into account for redraw
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
    var cals = Object.keys(this.activeCalendars);
    for (var i=0;i<cals.length;i++) {
        var cal = this.activeCalendars[cals[i]];
        CalEvent.retz(cal, this.showTZ, this.timezoneChanges);
    }
    this.modelProvider.saveState();
    if (!donotNotify)
        this.vis.modelChanged();
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

    var events, timezones;
    var props = this.calprops[label];
    var ptz = props && props.tz;
    if (label.endsWith(".ics")) {
        events = Ics.parse(msg, ptz, this.modelProvider.showTz.value);
    } else if (label.endsWith(".csv")) {
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
    console.log(this.timezoneChanges);
}

ProfileModel.prototype.loadPlan = function(plan) {
    var opts = {};
    opts['x-identity-token'] = this.storage.getToken();
    opts['x-calendar-name'] = plan;
    ajax("/ajax/retrieve-calendar.php", (stat, msg) => this.updateFromPlan(stat, msg), null, null, null, opts);
}

ProfileModel.prototype.updateFromPlan = function(stat, msg) {
    if (stat != 200) {
        console.log("ajax calendar request to load plan failed:", stat, msg);
        return;
    }

    var plan = JSON.parse(msg);
    console.log("have", plan);
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
    var ret = this.categoryConfigs[cat];
    if (ret)
        return ret;
    return { color: "--" };
}

ProfileModel.prototype.chooseCategoryColor = function(cat, color) {
    this.categoryConfigs[cat] = { color };
    this.storeCurrentState();
    this.vis.modelChanged();
}

/*

ProfileModel.prototype.storeCurrentState = function() {
    var statecals = [];
    for (var c of Object.keys(this.availableCalendars)) {
        if (this.availableCalendars[c]) {
            statecals.push(c);
        }
    }

    var state = {
        drawerState: this.drawerState,
        selectedCalendars: statecals,
        calendarProps: this.calprops,
        configs: this.categoryConfigs
    };

    this.storage.storeState("profile", state);
}
    */

export { ProfileModel };