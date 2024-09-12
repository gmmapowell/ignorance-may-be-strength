import { toggleHidden, hide, show, isShown } from "./utils.js";

function ManageCalendars(elts, model) {
    this.model = model;
    this.list = elts['manage-calendars-list'];
    this.detail = elts['manage-calendars-detail'];
    this.called = elts['manage-calendar-called'];
    this.tz = elts['manage-calendar-detail-timezone'];
    this.apply = elts['manage-calendar-apply'];
    this.apply.addEventListener('click', () => this.applyDetails());
}

ManageCalendars.prototype.provideProfiles = function(profiles) {
    this.profiles = profiles;
}

ManageCalendars.prototype.redraw = function() {
    var cals = Object.keys(this.model.availableCalendars);
    this.list.innerHTML = '';
    var x = document.createElement("input");
    x.setAttribute("type", "button");
    x.value = "X";
    this.list.appendChild(x);
    x.addEventListener('click', () => this.profiles.hideManage());
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