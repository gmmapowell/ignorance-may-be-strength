var start, end, first, fbdiv;

function init() {
	start = document.getElementById('start-date');
	end = document.getElementById('end-date');
	first = document.getElementById('first-day');
	fbdiv = document.getElementById('feedback');

	start.valueAsDate = new Date();
	end.valueAsDate = new Date();

	initStyling(fbdiv);

	addEventListener("resize", redraw);
	redraw();
}

function redraw() {
	var from = new Date(start.value);
	var to = new Date(end.value);
	var leftColumn = parseInt(first.value);
	console.log("Generating calendar from", from, "to", to, "based on", leftColumn);

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
		console.log(" showing week with", leftDate, "in the left column and", rightDate, "in the right column");

		// figure out if this is worthy of making a month
		if (leftDate.getMonth() != rightDate.getMonth()) {
			// we are not interested
			thisMonth = null;
		} else if (thisMonth && thisMonth.month == leftDate.getMonth()) { // if we are already recording this month, increment it
			thisMonth.numRows++;
		} else { // this week is all in this month and is a different month to what has gone before
			var watermark = document.createElement("div");
			watermark.classList = 'watermark watermark-' + watermarkNo;
			watermarkNo++;
			var text = leftDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric'});
			var wktext = document.createTextNode(text);
			watermark.appendChild(wktext);
			fbdiv.appendChild(watermark);
			thisMonth = { month: leftDate.getMonth(), year: leftDate.getFullYear(), from: rowInfo.numRows, numRows: 1, text };
			rowInfo.months.push(thisMonth);
		}

		// create a div for the whole week
		var week = document.createElement("div");
		week.className = "body-week";
		fbdiv.appendChild(week);
		for (var i=0;i<7;i++) {
			var cellDate = new Date(leftDate);
			cellDate.setDate(cellDate.getDate() + i);

			// create a div for each day, to contain all the aspects we will have
			var day = document.createElement("div");
			day.className = "body-day";
			week.appendChild(day);

			// the first aspect is the date
			var date = document.createElement("div");
			date.className = "body-day-date";
			day.appendChild(date);

			// and set the date text in here
			var dateValue = document.createTextNode(cellDate.getDate());
			date.appendChild(dateValue);
		}

		// advance to next week
		leftDate.setDate(leftDate.getDate() + 7);
		rowInfo.numRows++;
	} while (leftDate <= to);

	console.log(rowInfo);
	fitToPageSize(rowInfo);
}
