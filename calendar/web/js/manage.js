import { toggleHidden, hide, show, isShown } from "./utils.js";

function ManageCalendars(elts) {
    this.list = elts['manage-calendars-list'];
    this.detail = elts['manage-calendars-detail'];
    this.called = elts['manage-calendar-called'];
    this.apply = elts['manage-calendar-apply'];
    this.apply.addEventListener('click', () => this.applyDetails());
    this.cals = [];
}

ManageCalendars.prototype.provideProfiles = function(profiles) {
    this.profiles = profiles;
}

ManageCalendars.prototype.updateCalendarList = function(cals) {
    this.cals = cals;
}

ManageCalendars.prototype.redraw = function() {
    this.list.innerHTML = '';
    var x = document.createElement("input");
    x.setAttribute("type", "button");
    x.value = "X";
    this.list.appendChild(x);
    x.addEventListener('click', () => this.profiles.hideManage());
    var keys = Object.keys(this.cals);
    for (var i=0;i<keys.length;i++) {
        var k = keys[i];
        var c = this.cals[k];
        var e = document.createElement("input");
        e.setAttribute("type", "button");
        e.value = (k);
        e.addEventListener('click', showDetailFn(this, k, c));
        this.list.appendChild(e);
    }
    this.detail.classList.add("hidden");
}

function showDetailFn(obj, k, c) {
    return () => obj.showDetailsFor(k, c);
}

ManageCalendars.prototype.showDetailsFor = function(k, c) {
    this.detail.classList.remove("hidden");
    this.called.innerText = k;
}

ManageCalendars.prototype.applyDetails = function() {
    this.detail.classList.add("hidden");
}

export { ManageCalendars };