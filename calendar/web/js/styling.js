var styledDiv;
var sheet, printSheet;
var controlPane;

function initStyling(fbdiv) {
	styledDiv = fbdiv;
	controlPane = document.getElementById('controls');
	pageSizer = document.getElementById('page-size');
	isLandscape = document.getElementById('landscape');
	sheet = new CSSStyleSheet({ media: "screen" });
	printSheet = new CSSStyleSheet({ media: "print" });
	document.adoptedStyleSheets = [sheet, printSheet];
}

function fitToPageSize(rows) {
	pageLayout(sheet, rows, calculateSizeOfFeedbackDiv());
	pageLayout(printSheet, rows, calculatePaperSize());
}

function pageLayout(sheet, rows, pageSize) {
	// delete the old rules
	while (sheet.cssRules.length > 0)
		sheet.deleteRule(0);

	var innerX = pageSize.x, innerY = pageSize.y;
	if (pageSize.media == "print") {
		sheet.insertRule("@page { size: " + pageSize.x + pageSize.unitIn + " " + pageSize.y + pageSize.unitIn + " " + pageSize.orientation + "; margin: " + pageSize.margin + pageSize.unitIn + "; }")
		innerX -= 2 * pageSize.margin;
		innerY -= 2 * pageSize.margin;
	}

	// calculate desired box sizes
	var xunit = (innerX - 14 * pageSize.borderX) / 91;
	var xday = xunit*12;
	var xmargin = xunit/2;
	var xpos = xday / 5;
	var xsize = xday / 8;

	var yunit = (innerY - pageSize.borderY * 2 * rows)/ (rows * 13);
	var yweek = yunit*12;
	var ymargin = yunit/2;
	var ypos = yweek / 5;
	var ysize = Math.min(Math.max(yweek / 8, 8), yweek * 3/4);
	
	var dateSize = Math.min(xsize, ysize);

	// generate new rules
	sheet.insertRule(".feedback { border-width: " + pageSize.borderY + pageSize.unitIn + " " + pageSize.borderX + pageSize.unitIn +"; width: " + pageSize.x + pageSize.unitIn + "; height: " + pageSize.y + pageSize.unitIn + "; }");
	sheet.insertRule(".body-day { border-width: " + pageSize.borderY + pageSize.unitIn + " " + pageSize.borderX + pageSize.unitIn +"; width: " + xday + pageSize.unitIn + "; height: " + yweek + pageSize.unitIn + "; margin: " + ymargin + pageSize.unitIn + " " + xmargin + pageSize.unitIn + " }");
	sheet.insertRule(".body-day-date { top: " + ypos + pageSize.unitIn + "; left: " + xpos + pageSize.unitIn + "; font-size: " + dateSize + pageSize.unitIn + " }");
}

function calculateSizeOfFeedbackDiv() {
	var borderX = 1, borderY = 1;
	var viewx = window.innerWidth;
	var viewy = window.innerHeight;

	var fbx = viewx - 16 - borderX * 2; // 16 for double body margin
	var fby = viewy - controlPane.clientHeight - 16 - borderY * 2;

	return { media: "screen", x : fbx, y : fby, unitIn: "px", borderX, borderY };
}

function calculatePaperSize() {
	var currentSize = pageSizer.value;
	var andLandscape = isLandscape.checked;
	console.log("laying out for", currentSize, andLandscape);
	var borderX = 1, borderY = 1;
	var ret;
	switch (currentSize) {
		case "letter":
			borderX = borderY = 0.04;
			ret = { media: "print", margin: 0.25, orientation: "portrait", x : 8.5, y : 11, unitIn: "in", borderX, borderY };
			break;
		case "tabloid":
			borderX = borderY = 0.04;
			ret = { media: "print", margin: 0.25, orientation: "portrait", x : 11, y : 17, unitIn: "in", borderX, borderY };
			break;
		case "a3":
			ret = { media: "print", margin: 6, orientation: "portrait", x : 297, y : 420, unitIn: "mm", borderX, borderY };
			break;
		default: /* use A4 as default, just in case */
			ret = { media: "print", margin: 6, orientation: "portrait", x : 210, y : 297, unitIn: "mm", borderX, borderY };
			break;
	}
	if (andLandscape) {
		var tmp = ret.x;
		ret.x = ret.y;
		ret.y = tmp;
		ret.borderX = borderY;
		ret.borderY = borderX;
	}
	return ret;
}
