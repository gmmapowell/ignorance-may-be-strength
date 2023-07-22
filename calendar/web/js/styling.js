var styledDiv;
var sheet, printSheet;
var controlPane;
var canvas, cx;
var metricFontSize = 10;

function initStyling(fbdiv) {
	styledDiv = fbdiv;
	controlPane = document.getElementById('controls');
	pageSizer = document.getElementById('page-size');
	isLandscape = document.getElementById('landscape');
	canvas = document.getElementById("canvas");
	sheet = new CSSStyleSheet({ media: "screen" });
	printSheet = new CSSStyleSheet({ media: "print" });
	document.adoptedStyleSheets = [sheet, printSheet];
	cx = canvas.getContext("2d");
	cx.font = metricFontSize + "pt sans-serif";
}

function fitToPageSize(rowInfo) {
	pageLayout(sheet, rowInfo, calculateSizeOfFeedbackDiv());
	pageLayout(printSheet, rowInfo, calculatePaperSize());
}

function pageLayout(sheet, rowInfo, pageSize) {
	var rows = rowInfo.numRows;

	// delete the old rules
	while (sheet.cssRules.length > 0)
		sheet.deleteRule(0);

	var innerX = pageSize.x, innerY = pageSize.y;
	var hackX = 1;
	if (pageSize.media == "print") {
		sheet.insertRule("@page { size: " + pageSize.x + pageSize.unitIn + " " + pageSize.y + pageSize.unitIn + " " + pageSize.orientation + "; margin: " + pageSize.margin + pageSize.unitIn + "; }")
		innerX -= 3 * pageSize.margin;
		innerY -= 3 * pageSize.margin; // I feel this should be 2, but that doesn't work, so I chose 3.  Maybe at some point I will discover what I've missed
		hackX = 0.95;
	}

	// calculate desired box sizes
	var xunit = (innerX - 14 * pageSize.borderX) / 91;
	xunit *= hackX; // a hack because I don't understand what causes the printer version to wrap
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

	var eventsContainerY = 2 * ypos;

	// generate new rules
	sheet.insertRule(".feedback { border-width: " + pageSize.borderY + pageSize.unitIn + " " + pageSize.borderX + pageSize.unitIn +"; width: " + innerX + pageSize.unitIn + "; height: " + innerY + pageSize.unitIn + "; }");
	sheet.insertRule(".body-day { border-width: " + pageSize.borderY + pageSize.unitIn + " " + pageSize.borderX + pageSize.unitIn +"; width: " + xday + pageSize.unitIn + "; height: " + yweek + pageSize.unitIn + "; margin: " + ymargin + pageSize.unitIn + " " + xmargin + pageSize.unitIn + " }");
	sheet.insertRule(".body-day-date { top: " + ypos + pageSize.unitIn + "; left: " + xpos + pageSize.unitIn + "; font-size: " + dateSize + pageSize.unitIn + " }");
	sheet.insertRule(".body-day-events-container { top: " + eventsContainerY + pageSize.unitIn + "; font-size: " + dateSize + pageSize.unitIn + " }");

	for (var i=0;i<rowInfo.months.length;i++) {
		handleWatermarks(sheet, i, rowInfo.months[i], pageSize.unitIn, xday, xmargin, yweek, ymargin);
	}
}

function handleWatermarks(sheet, idx, rowInfo, unitIn, xcell, xmargin, ycell, ymargin) {
	var mx = cx.measureText(rowInfo.text);
	var width = mx.actualBoundingBoxRight + mx.actualBoundingBoxLeft;
	var height = mx.actualBoundingBoxDescent + mx.actualBoundingBoxAscent;
	switch (unitIn) {
		case "mm": {
			width /= 3.78;
			height /= 3.78;
			break;
		}
		case "in": {
			width /= 96;
			height /= 96;
			break;
		}
	}

	var availx = 7 * xcell + 6 * xmargin * 2;
	var availy = rowInfo.numRows * ycell + (rowInfo.numRows-1) * ymargin * 2;
	
	var scalex = availx/width;
	var scaley = availy/height;
	var scale = Math.min(scalex, scaley) * .75; // .75 to leave some space around the edges

	var usedx = scale * width;
	var usedy = scale * height;
	var left = (availx - usedx) / 2;
	var top = (availy - usedy) / 2 + rowInfo.from * (ycell + ymargin * 2);

	sheet.insertRule(".watermark-" +  idx + "{ font-size: " + scale*metricFontSize + "pt; left: " + left + unitIn + "; top: " + top + unitIn + "; }");
}

function calculateSizeOfFeedbackDiv() {
	var borderX = 1, borderY = 1;
	var viewx = window.innerWidth;
	var viewy = window.innerHeight;

	var fbx = viewx - 16 - borderX * 2; // 16 for double body margin
	var fby = viewy - controlPane.clientHeight - 16 - borderY * 2;

	return { media: "screen", margin: 0, x : fbx, y : fby, unitIn: "px", borderX, borderY };
}

function calculatePaperSize() {
	var currentSize = pageSizer.value;
	var andLandscape = isLandscape.checked;
	var ret;
	switch (currentSize) {
		case "letter":
			ret = { media: "print", margin: 0.25, orientation: "portrait", x : 8.5, y : 11, unitIn: "in", borderX: 0.01, borderY: 0.01 };
			break;
		case "tabloid":
			ret = { media: "print", margin: 0.25, orientation: "portrait", x : 11, y : 17, unitIn: "in", borderX: 0.01, borderY: 0.01 };
			break;
		case "a3":
			ret = { media: "print", margin: 6, orientation: "portrait", x : 297, y : 420, unitIn: "mm", borderX: 0.1, borderY: 0.1 };
			break;
		default: /* use A4 as default, just in case */
			ret = { media: "print", margin: 6, orientation: "portrait", x : 210, y : 297, unitIn: "mm", borderX: 0.1, borderY: 0.1 };
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
