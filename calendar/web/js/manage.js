import { Ajax } from "./ajax.js";
import { ElementWithId, ControllerOfType } from "./autowire.js";
import { ModeOptions } from "./modeOptions.js";
import { ProfileModel } from "./profilemodel.js";
import { Profiles } from "./profiles.js";

function ManageCalendars() {
    this.model = new ControllerOfType(ProfileModel);
    this.profiles = new ControllerOfType(Profiles);
    this.modeOptions = new ControllerOfType(ModeOptions);
    this.ajax = new ControllerOfType(Ajax);

    this.closeMe = new ElementWithId('close-manage-calendars');
    this.list = new ElementWithId('manage-calendars-list');
    this.detail = new ElementWithId('manage-calendars-detail');
    this.called = new ElementWithId('manage-calendar-called');
    this.tz = new ElementWithId('manage-calendar-detail-timezone');
    this.apply = new ElementWithId('manage-calendar-apply');
    this.delete = new ElementWithId('manage-calendar-delete');
}

ManageCalendars.prototype.init = function() {
    this.apply.addEventListener('click', () => this.applyDetails());
    this.delete.addEventListener('click', () => this.deleteCalendar());
    this.closeMe.addEventListener('click', () => this.profiles.hideManage());
}

ManageCalendars.prototype.provideProfiles = function(profiles) {
    this.profiles = profiles;
}

ManageCalendars.prototype.redraw = function() {
    var acs = this.model.selectedCalendars.value();
    var cals = Object.keys(acs).sort();
    this.list.innerHTML = '';
    for (var i=0;i<cals.length;i++) {
        var k = cals[i];
        var e = document.createElement("input");
        e.setAttribute("type", "button");
        e.value = (k);
        e.addEventListener('click', showDetailFn(this, k));
        this.list.appendChild(e);
    }
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
    this.modeOptions.showManageDetails();
}

ManageCalendars.prototype.applyDetails = function() {
    var k = this.currentCalendar;
    this.model.calprops[k] = { tz: this.tz.selectedOptions[0].value };
    this.currentCalendar = null;
    this.modeOptions.hideManageDetails();
}

ManageCalendars.prototype.deleteCalendar = function() {
    console.log("delete", this.currentCalendar);
    this.ajax.secureUri("/ajax/delete-calendar.php")
        .header('x-calendar-name', this.currentCalendar)
        .invoke((stat, msg) => this.refreshCalendars(stat, msg));
    this.modeOptions.hideManageDetails();
}

ManageCalendars.prototype.refreshCalendars = function(stat, msg) {
    this.model.loadAvailableCalendars();
}

export { ManageCalendars };