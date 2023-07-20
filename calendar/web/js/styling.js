var styledDiv;
var sheet, printSheet;
var controlPane;

function initStyling(fbdiv) {
	styledDiv = fbdiv;
	controlPane = document.getElementById('controls');
	sheet = new CSSStyleSheet({ media: "screen" });
	printSheet = new CSSStyleSheet({ media: "print" });
	document.adoptedStyleSheets = [sheet, printSheet];
}

function fitToPageSize(rows) {
	pageLayout(sheet, rows, calculateSizeOfFeedbackDiv());
}

function pageLayout(sheet, rows, pageSize) {
	// delete the old rules
	while (sheet.cssRules.length > 0)
		sheet.deleteRule(0);

	// calculate desired box sizes
	var xunit = (pageSize.x - 14 * pageSize.borderX) / 91;
	var xday = xunit*12;
	var xmargin = xunit/2;
	var xpos = xday / 5;
	var xsize = xday / 8;

	var yunit = (pageSize.y - pageSize.borderY * 2 * rows)/ (rows * 13);
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

	return { x : fbx, y : fby, unitIn: "px", borderX, borderY };
}
