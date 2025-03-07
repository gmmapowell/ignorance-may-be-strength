import { ControllerOfType, ElementWithId } from "./autowire.js";
import { ProfileModel } from "./profilemodel.js";

function ModelProvider() {
    this.start = new ElementWithId('start-date', 'value').storedAs('core', 'start', new Date().toISOString().substring(0, 10));
    this.end = new ElementWithId('end-date', 'value').storedAs('core', 'end', new Date().toISOString().substring(0, 10));
    this.first = new ElementWithId('first-day', 'value').storedAs('core', 'first', 1);
	this.showTz = new ElementWithId('calendar-time-zone', 'value').storedAs('core', 'showTz', 'SYSTEM');
    this.weekendShadeOption = new ElementWithId('shade-weekends', 'value').storedAs('core', 'weekendShadeOption', true);
	this.profile = new ControllerOfType(ProfileModel);
	this.recoveredPlan = null;
}

function utc(d) {
	return new Date(d.getTime() + d.getTimezoneOffset() * 60000);
}

ModelProvider.prototype.reset = function() {
	this.start.valueAsDate = new Date();
	this.end.valueAsDate = new Date();
	this.showTz.value = "SYSTEM";
	this.weekendShadeOption.value = true;
	this.first.value = 1;
	this.recoveredPlan = null;
}

ModelProvider.prototype.overridePlan = function(loadedPlan) {
	this.recoveredPlan = loadedPlan;
}

ModelProvider.prototype.calculate = function() {
	if (this.recoveredPlan) {
		return this.recoveredPlan;
	}

    var from = utc(new Date(this.start.value));
	var to = utc(new Date(this.end.value));
	var leftColumn = parseInt(this.first.value);
	var shadeWeekends = this.weekendShadeOption.checked;

    var leftDate = new Date(from);
	leftDate.setDate(leftDate.getDate() - leftDate.getDay() + leftColumn);
	if (leftDate > from) {
		leftDate.setDate(leftDate.getDate() - 7);
	}

    var weeks = [];
	var rowInfo = { numRows: 0, months: [] };

    var thisMonth = null;
	var watermarkNo = 0;
	do {
		var rightDate = new Date(leftDate);
		rightDate.setDate(rightDate.getDate() + 6);

		// figure out if this is worthy of making a month
		if (leftDate.getMonth() != rightDate.getMonth()) {
			// we are not interested
			thisMonth = null;
		} else if (thisMonth && thisMonth.month == leftDate.getMonth()) { // if we are already recording this month, increment it
			thisMonth.numRows++;
		} else { // this week is all in this month and is a different month to what has gone before
			var text = leftDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric'});
			thisMonth = { month: leftDate.getMonth(), year: leftDate.getFullYear(), from: rowInfo.numRows, numRows: 1, text, watermarkNo };
			rowInfo.months.push(thisMonth);

			watermarkNo++;
		}

		// create a div for the whole week
        var days = [];
        weeks.push({ thisMonth, days });
		for (var i=0;i<7;i++) {
			var cellDate = new Date(leftDate);
			cellDate.setDate(cellDate.getDate() + i);

			var calDate = cellDate.getFullYear() + "-" + (cellDate.getMonth()+1).toString().padStart(2, '0') + "-" + cellDate.getDate().toString().padStart(2, '0');

            var shadeMe = shadeWeekends && (cellDate.getDay() ==0 || cellDate.getDay() == 6);

			var events = [];
			var cats = new Set();
			var cals = this.profile.activeCalendars;
			var keys = Object.keys(cals);
			for (var ik in keys) {
				var url = keys[ik];
				collectEvents(events, cats, cals[url], calDate);
			}

			var highlights = new Set();
			if (cats.size > 0) {
				for (var c of cats) {
					var cat = this.profile.category(c);
					if (cat && cat.color) {
						highlights.add({ color: cat.color });
					}
				}
			}
			var toShow = [];
			if (events.length > 0) {
				for (var j=0;j<events.length;j++) {
					var next = structuredClone(events[j]);
					if (!next.end && next.category) {
						var cat = this.profile.category(next.category);
						if (cat && cat.color) {
							next.color = cat.color;
						}
					}
					for (var k=0;k<toShow.length;k++) {
						if (next.starttime < toShow[k].starttime) {
							toShow.splice(k, 0, next);
							next = null;
							break;
						}
					}
					if (next != null)
						toShow.push(next);
				}
			}
            days.push({ cellDate: cellDate.getDate(), calDate, colors: null, toShow, shadeMe , highlights: Array.from(highlights).sort() });
		}

		// advance to next week
		leftDate.setDate(leftDate.getDate() + 7);
		rowInfo.numRows++;
	} while (leftDate <= to);

    return { weeks, rowInfo, showTz: this.showTz.value };
}

function collectEvents(into, cats, cal, forDate) {
	for (var i=0;i<cal.length;i++) {
		var ev = cal[i];
		if (ev.startdate == forDate) {
			into.push(ev);
		}
		if (ev.category && ev.startdate <= forDate && ev.until >= forDate) {
			cats.add(ev.category);
		}
	}
}

export { ModelProvider };