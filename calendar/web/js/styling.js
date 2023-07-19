var styledDiv;
var sheet;
var controlPane;
var borderX = 1, borderY = 1;

function initStyling(fbdiv) {
	styledDiv = fbdiv;
	controlPane = document.getElementById('controls');
	sheet = new CSSStyleSheet();
	document.adoptedStyleSheets = [sheet];
}

function fitToPageSize(rows) {
	// delte the old rules
	while (sheet.cssRules.length > 0)
		sheet.deleteRule(0);

	// calculate the page size
	var pageSize = calculateSizeOfFeedbackDiv();
	var unitIn = "px";

	// calculate desired box sizes
	var xunit = (pageSize.x - 14 * borderX) / 91;
	var xday = xunit*12;
	var xmargin = xunit/2;
	var xpos = xday / 5;
	var xsize = xday / 8;

	var yunit = (pageSize.y - borderY * 2 * rows)/ (rows * 13);
	var yweek = yunit*12;
	var ymargin = yunit/2;
	var ypos = yweek / 5;
	var ysize = Math.min(Math.max(yweek / 8, 8), yweek * 3/4);
	
	var dateSize = Math.min(xsize, ysize);

	// generate new rules
	sheet.insertRule(".feedback { border-width: " + borderY + unitIn + " " + borderX + unitIn +"; width: " + pageSize.x + "px; height: " + pageSize.y + "px; }");
	sheet.insertRule(".body-day { border-width: " + borderY + unitIn + " " + borderX + unitIn +"; width: " + xday + unitIn + "; height: " + yweek + unitIn + "; margin: " + ymargin + unitIn + " " + xmargin + unitIn + " }");
	sheet.insertRule(".body-day-date { top: " + ypos + unitIn + "; left: " + xpos + unitIn + "; font-size: " + dateSize + unitIn + " }");
}

function calculateSizeOfFeedbackDiv() {
	var viewx = window.innerWidth;
	var viewy = window.innerHeight;

	var fbx = viewx - 16 - borderX * 2; // 16 for double body margin
	var fby = viewy - controlPane.clientHeight - 16 - borderY * 2;

	return { x : fbx, y : fby };
}
