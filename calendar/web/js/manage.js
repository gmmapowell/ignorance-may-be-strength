import { toggleHidden, hide, show, isShown } from "./utils.js";

function ManageCalendars(elts) {
    this.panel = elts['manage-calendars-panel'];
    this.cals = [];
}

ManageCalendars.prototype.updateCalendarList = function(cals) {
    this.cals = cals;
}

ManageCalendars.prototype.redraw = function() {
    var keys = Object.keys(this.cals);
    for (var i=0;i<keys.length;i++) {
        var k = keys[i];
        var c = this.cals[k];
        var e = document.createElement("input");
        e.setAttribute("type", "button");
        e.value = (k);
        // var t = document.createTextNode(k);
        // e.appendChild(t);
        this.panel.appendChild(e);
    }
}

export { ManageCalendars };