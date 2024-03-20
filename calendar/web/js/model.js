
function ModelProvider(core, prof) {
    this.start = core['start-date'];
    this.end = core['end-date'];
    this.first = core['first-day'];
    this.weekendShadeOption = core['shade-weekends'];
	this.profile = prof;
}

function utc(d) {
	return new Date(d.getTime() + d.getTimezoneOffset() * 60000);
}

ModelProvider.prototype.calculate = function() {
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
			for (var url in this.profile.activeCalendars) {
				collectEvents(events, cats, this.profile.activeCalendars[url], calDate);
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
					var next = events[j];
					for (var k=0;k<toShow.length;k++) {
						if (next.time < toShow[k].time) {
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

    return { weeks, rowInfo };
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