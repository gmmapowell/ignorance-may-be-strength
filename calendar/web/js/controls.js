// TODO: this has a mix of things.
// adding a calendar is part of the profile model.
// toggling a calendar is a control, but somewhat dependent on the calendar existing


var redraw;
var calendars;
var scdiv;

function initCalendars(c, s, r) {
	redraw = r;
	calendars = c;
	scdiv = s;
}



function addCalendar(url, cal) {
	calendars[url] = { info: cal, used: true };
	scdiv.innerHTML = '';
	for (var u in calendars) {
		var elt = document.createElement("div");
		elt.class = 'select-one-calendar';
		var cb = document.createElement("input");
		cb.type = 'checkbox';
		cb.checked = calendars[u].used;
		cb.myurl = u;
		cb.onclick = toggleCalendar;
		elt.appendChild(cb);
		var tx = document.createTextNode(u);
		elt.appendChild(tx);
		scdiv.appendChild(elt);
	}
}

function toggleCalendar(event) {
	calendars[event.target.myurl].used = event.target.checked;
	redraw.redraw();
}

export { initCalendars, addCalendar, toggleCalendar };