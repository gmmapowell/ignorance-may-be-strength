import { ajax } from './ajax.js';
import { CsvCalendar } from './csvcalendar.js';
import { Ics } from './ics.js';

function ProfileModel(storage) {
    this.storage = storage;
    this.drawerState = false;
    this.availableCalendars = {};
    this.activeCalendars = {};
    this.calprops = {};
    this.calendarCategories = {};
    this.categoryConfigs = {};
    this.savedPlans = [];
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

        // selectCalendar is a bit heavyweight for this since it writes state back
        // NB: Any other state must be read BEFORE we do this
        // TODO: split this into two steps: read the active calendars, then select them
        if (state.selectedCalendars) {
            for (var c of state.selectedCalendars) {
                this.selectCalendar(c, true);
            }
        }
        if (this.drawerState) {
            vis.openDrawer();
        }
        vis.modelChanged();
    }
}

ProfileModel.prototype.reset = function() {
    this.drawerState = false;
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
    this.drawerState = isOpen;
    this.storeCurrentState();
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

ProfileModel.prototype.selectCalendar = function(label, selected) {
    this.availableCalendars[label] = selected;
    this.storeCurrentState();

    if (selected) {
        // so the next step is to retrieve and parse this
        // I think we want to retrieve it every time we select it to allow for updates
        var opts = {};
        opts['x-identity-token'] = this.storage.getToken();
        opts['x-calendar-name'] = label;
        ajax("/ajax/retrieve-calendar.php", (stat, msg) => this.parseCalendar(label, stat, msg), null, null, null, opts);
        // and then somewhere else this model needs to be taken into account for redraw
    } else {
        // clear out the parsed version of the calendar (if any)
        delete this.activeCalendars[label]; // if it has been loaded and parsed
        delete this.calendarCategories[label];
        this.vis.modelChanged();
    }
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
    } else if (label.endsWith(".csv")) {
        events = CsvCalendar.parse(msg);
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

    this.vis.modelChanged();
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

export { ProfileModel };