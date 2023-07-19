var styledDiv;
var sheet;
var controlPane;

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
	var xunit = Math.floor(pageSize.x / 91);
	var xday = xunit*12;
	var xmargin = xunit/2;
	var xpos = xday / 5;
	var xsize = xday / 8;

	var yunit = Math.floor(pageSize.y / (rows * 13));
	var yweek = yunit*12;
	var ymargin = yunit/2;
	var ypos = yweek / 5;
	var ysize = Math.min(Math.max(yweek / 8, 8), yweek * 3/4);
	
	var dateSize = Math.min(xsize, ysize);

	// generate new rules
	sheet.insertRule(".feedback { border-width: 0.1mm; width: " + pageSize.x + "px; height: " + pageSize.y + "px; }");
	sheet.insertRule(".body-day { border-width: 0.1mm; width: " + xday + unitIn + "; height: " + yweek + unitIn + "; margin: " + ymargin + unitIn + " " + xmargin + unitIn + " }");
	sheet.insertRule(".body-day-date { top: " + ypos + unitIn + "; left: " + xpos + unitIn + "; font-size: " + dateSize + unitIn + " }");
}

function calculateSizeOfFeedbackDiv() {
	var viewx = window.innerWidth;
	var viewy = window.innerHeight;

	var fbx = viewx - 16 - 5; // 16 for double body margin // allow, say, 5 for border
	var fby = viewy - controlPane.clientHeight - 16 - 5;

	return { x : fbx, y : fby };
}
