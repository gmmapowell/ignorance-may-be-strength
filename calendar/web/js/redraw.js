import { fitToPageSize } from "./styling.js";

var redrawWhenResized = true;
var start, end, first, weekendShadeOption, fbdiv, colors, calendars;

function RedrawClz(m, s, e, f, w, b, c, c2) {
    this.modelProvider = m;
    start = s;
    end = e;
    first = f;
    weekendShadeOption = w;
    fbdiv = b;
    colors = c;
    calendars = c2;
}

function redrawMode(b) {
	redrawWhenResized = b;
}

function redrawOnResize(ev) {
	if (redrawWhenResized)
		redraw();
}

function utc(d) {
	return new Date(d.getTime() + d.getTimezoneOffset() * 60000);
}

RedrawClz.prototype.redraw = function() {
	var from = utc(new Date(start.value));
	var to = utc(new Date(end.value));
	var leftColumn = parseInt(first.value);
	var shadeWeekends = weekendShadeOption.checked;

	fbdiv.innerHTML = '';
	var leftDate = new Date(from);
	leftDate.setDate(leftDate.getDate() - leftDate.getDay() + leftColumn);
	if (leftDate > from) {
		leftDate.setDate(leftDate.getDate() - 7);
	}
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
			var namedMonth = document.createElement("div");
			namedMonth.className = 'namedMonth';

			var watermark = document.createElement("div");
			watermark.classList = 'watermark watermark-' + watermarkNo;
			var text = leftDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric'});
			var wktext = document.createTextNode(text);
			watermark.appendChild(wktext);
			namedMonth.appendChild(watermark)
			fbdiv.appendChild(namedMonth);
			thisMonth = { month: leftDate.getMonth(), year: leftDate.getFullYear(), from: rowInfo.numRows, numRows: 1, text, div: namedMonth };
			rowInfo.months.push(thisMonth);

			watermarkNo++;
		}

		// create a div for the whole week
		var week = document.createElement("div");
		week.className = "body-week";
		if (thisMonth) {
			thisMonth.div.appendChild(week);
		} else {
			fbdiv.appendChild(week);
		}
		for (var i=0;i<7;i++) {
			var cellDate = new Date(leftDate);
			cellDate.setDate(cellDate.getDate() + i);

			// create a div for each day, to contain all the aspects we will have
			var day = document.createElement("div");
			day.className = "body-day";
			if (shadeWeekends && (cellDate.getDay() ==0 || cellDate.getDay() == 6)) {
				day.classList.add('weekend');
			}
			week.appendChild(day);

			// the first aspect is the date
			var date = document.createElement("div");
			date.className = "body-day-date";
			day.appendChild(date);

			// and set the date text in here
			var dateValue = document.createTextNode(cellDate.getDate());
			date.appendChild(dateValue);

			var calDate = cellDate.getFullYear() + "-" + (cellDate.getMonth()+1).toString().padStart(2, '0') + "-" + cellDate.getDate().toString().padStart(2, '0');

			var cd = colors[calDate];
			if (cd) {
				var colorBars = document.createElement("div");
				colorBars.className = "body-day-color-bars";
				day.appendChild(colorBars);
				for (var j=0;j<cd.length;j++) {
					var bar = document.createElement("div");
					var itemNo = "";
					if (j > 0) {
						itemNo = " body-day-color-bar-" + (j+1) + "-of-" + cd.length;
					}
					bar.className = "body-day-color-bar body-day-color-bar-" + cd.length + itemNo + " body-day-color-" + cd[j].color;
					var tx = document.createTextNode(cd[j].label);
					bar.appendChild(tx);
					colorBars.appendChild(bar);
				}
			}
			
			var toShow = [];
			for (var url in calendars) {
				var cal = calendars[url];
				if (!cal.used)
					continue;
				var today = cal.info[calDate];
				if (!today)
					continue;
				for (var j=0;j<today.length;j++) {
					var next = today[j];
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

			if (toShow.length > 0) {
				var events = document.createElement("div");
				events.className = "body-day-events-container";
				day.appendChild(events);

				for (var j=0;j<toShow.length;j++) {
					var event = document.createElement("div");
					event.className = "body-day-event";
					events.appendChild(event);
					var timeText = document.createTextNode(toShow[j].time);
					var timeSpan = document.createElement("span");
					timeSpan.className = "body-day-event-time";
					timeSpan.appendChild(timeText);
					event.appendChild(timeSpan);
					var eventText = document.createTextNode(" " + toShow[j].summary);
					var eventSpan = document.createElement("span");
					eventSpan.className = "body-day-event-text";
					eventSpan.appendChild(eventText);
					event.appendChild(eventSpan);
				}
			}
		}

		// advance to next week
		leftDate.setDate(leftDate.getDate() + 7);
		rowInfo.numRows++;
	} while (leftDate <= to);

	fitToPageSize(rowInfo);
}

export { RedrawClz, redrawOnResize, redrawMode };