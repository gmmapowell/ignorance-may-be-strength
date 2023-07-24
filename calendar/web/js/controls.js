var start, end, first, fbdiv, scdiv, weekendShadeOption;
var calendars;

function init() {
	start = document.getElementById('start-date');
	end = document.getElementById('end-date');
	first = document.getElementById('first-day');
	fbdiv = document.getElementById('feedback');
	scdiv = document.getElementById('select-calendars');
	weekendShadeOption = document.getElementById('shade-weekends');

	calendars = {};

	start.valueAsDate = new Date();
	end.valueAsDate = new Date();

	initStyling(fbdiv);
	initSharing();

	addEventListener("resize", redraw);
	redraw();
}

function redraw() {
	var from = new Date(start.value);
	var to = new Date(end.value);
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
	redraw();
}