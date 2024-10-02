import { ElementWithId, ControllerOfType } from "./autowire.js";
import { ProfileModel } from "./profilemodel.js";
import { Profiles } from "./profiles.js";

function ManageCalendars() {
    this.model = new ControllerOfType(ProfileModel);
    this.profiles = new ControllerOfType(Profiles);

    this.closeMe = new ElementWithId('close-manage-calendars');
    this.list = new ElementWithId('manage-calendars-list');
    this.detail = new ElementWithId('manage-calendars-detail');
    this.called = new ElementWithId('manage-calendar-called');
    this.tz = new ElementWithId('manage-calendar-detail-timezone');
    this.apply = new ElementWithId('manage-calendar-apply');
}

ManageCalendars.prototype.init = function() {
    this.apply.addEventListener('click', () => this.applyDetails());
    /*
    var x = document.createElement("input");
    x.setAttribute("type", "button");
    x.value = "X";
    this.list.appendChild(x);
    */
    this.closeMe.addEventListener('click', () => this.profiles.hideManage());
}

ManageCalendars.prototype.provideProfiles = function(profiles) {
    this.profiles = profiles;
}

ManageCalendars.prototype.redraw = function() {
    var cals = Object.keys(this.model.availableCalendars);
    this.list.innerHTML = '';
    for (var i=0;i<cals.length;i++) {
        var k = cals[i];
        var e = document.createElement("input");
        e.setAttribute("type", "button");
        e.value = (k);
        e.addEventListener('click', showDetailFn(this, k));
        this.list.appendChild(e);
    }
    this.detail.classList.add("hidden");
}

function showDetailFn(obj, k) {
    return () => obj.showDetailsFor(k, obj.model.calprops[k]);
}

ManageCalendars.prototype.showDetailsFor = function(k, c) {
    this.currentCalendar = k;
    if (c && c.tz) {
        this.tz.value = c.tz;
    } else {
        this.tz.value = "NONE";
    }
    this.detail.classList.remove("hidden");
    this.called.innerText = k;
}

ManageCalendars.prototype.applyDetails = function() {
    var k = this.currentCalendar;
    this.model.calprops[k] = { tz: this.tz.selectedOptions[0].value };
    this.model.storeCurrentState();
    this.currentCalendar = null;
    this.detail.classList.add("hidden");
}

export { ManageCalendars };