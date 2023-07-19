var styledDiv;
var sheet;
var controlPane;

function initStyling(fbdiv) {
	styledDiv = fbdiv;
	controlPane = document.getElementById('controls');
	sheet = new CSSStyleSheet();
	document.adoptedStyleSheets = [sheet];
}

function fitToPageSize() {
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



	// generate new rules
	sheet.insertRule(".feedback { border-width: 0.1mm; width: " + pageSize.x + "px; height: " + pageSize.y + "px; }");
	sheet.insertRule(".body-day { border-width: 0.1mm; width: " + xday + unitIn + "; height: 25mm; margin: " + xmargin + unitIn + " }");
	sheet.insertRule(".body-day-date { top: 3mm; left: 3mm; font-size: 5mm }");
}

function calculateSizeOfFeedbackDiv() {
	var viewx = window.innerWidth;
	var viewy = window.innerHeight;

	var fbx = viewx - 16 - 5; // 16 for double body margin // allow, say, 5 for border
	var fby = viewy - controlPane.clientHeight - 16 - 5;

	return { x : fbx, y : fby };
}
