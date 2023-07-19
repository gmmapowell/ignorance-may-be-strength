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
	var numRows = 0;
	do {
		console.log(" showing week with", leftDate, "in the left column");

		// create a div for the whole week
		var week = document.createElement("div");
		week.className = "body-week";
		fbdiv.appendChild(week);
		for (var i=0;i<7;i++) {
			var cellDate = new Date(leftDate);
			cellDate.setDate(cellDate.getDate() + i);
			console.log("  cell", i, "has date", cellDate);

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
		numRows++;
	} while (leftDate <= to);

	fitToPageSize(numRows);
}
