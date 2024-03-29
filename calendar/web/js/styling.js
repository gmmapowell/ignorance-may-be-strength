function Styling(storage, sections, print) {
	this.storage = storage;
	this.styledDiv = sections['feedback'];
	this.controlPane = sections['controls'];
	this.optionsDrawer = sections['options-drawer'];
	this.pageSizer = print['page-size'];
	this.isLandscape = print['landscape'];
	this.screenSheet = new CSSStyleSheet({ media: "screen" });
	this.printSheet = new CSSStyleSheet({ media: "print" });
	this.printMeasureSheet = new CSSStyleSheet({ media: "screen" });
	this.metricFontSize = 10;
	this.screenWatermarks = {};
	document.adoptedStyleSheets = [this.screenSheet, this.printSheet];
}

Styling.prototype.saveState = function() {
	var print = { size: this.pageSizer.value, landscape: this.isLandscape.checked };
	this.storage.storeState("print", print);
}

Styling.prototype.restoreState = function() {
	var print = this.storage.currentState("print");
	if (print) {
		this.pageSizer.value = print.size;
		this.isLandscape.checked = print.landscape;
	}
}

Styling.prototype.reset = function() {
	this.pageSizer.value = "A4";
	this.isLandscape.checked = false;
	this.saveState();
}

Styling.prototype.fitToPageSize = function(rowInfo, monthdivs) {
	this.screenWatermarks = {};
	this.pageLayout([this.screenSheet], rowInfo, monthdivs, this.calculateSizeOfFeedbackDiv());
	document.adoptedStyleSheets = [this.printMeasureSheet];
	this.pageLayout([this.printSheet, this.printMeasureSheet], rowInfo, monthdivs, this.calculatePaperSize());
	document.adoptedStyleSheets = [this.screenSheet, this.printSheet];
}

Styling.prototype.pageLayout = function(sheets, rowInfo, monthdivs, pageSize) {
	var rows = rowInfo.numRows;

	// delete the old rules
	for (var i=0;i<sheets.length;i++) {
		var sheet = sheets[i];
		while (sheet.cssRules.length > 0)
			sheet.deleteRule(0);
	}

	var innerX = pageSize.x, innerY = pageSize.y;
	var hackX = 1;

	if (pageSize.media == "print") {
		this.insertRuleIntoSheets(sheets, "@page { size: " + pageSize.x + pageSize.unitIn + " " + pageSize.y + pageSize.unitIn + " " + pageSize.orientation + "; margin: " + pageSize.margin + pageSize.unitIn + "; }")
		innerX -= 3 * pageSize.margin;
		innerY -= 5 * pageSize.margin; // I feel this should be 2, but that doesn't work, so I ended up with 5.  Maybe at some point I will discover what I've missed
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
	this.insertRuleIntoSheets(sheets, ".feedback { border-width: " + pageSize.borderY + pageSize.unitIn + " " + pageSize.borderX + pageSize.unitIn +"; width: " + innerX + pageSize.unitIn + "; height: " + innerY + pageSize.unitIn + "; }");
	this.insertRuleIntoSheets(sheets, ".body-day { border-width: " + pageSize.borderY + pageSize.unitIn + " " + pageSize.borderX + pageSize.unitIn +"; width: " + xday + pageSize.unitIn + "; height: " + yweek + pageSize.unitIn + "; margin: " + ymargin + pageSize.unitIn + " " + xmargin + pageSize.unitIn + " }");
	this.insertRuleIntoSheets(sheets, ".body-day-date { top: " + ypos + pageSize.unitIn + "; left: " + xpos + pageSize.unitIn + "; font-size: " + dateSize + pageSize.unitIn + " }");
	this.insertRuleIntoSheets(sheets, ".body-day-events-container { top: " + eventsContainerY + pageSize.unitIn + "; font-size: " + dateSize + pageSize.unitIn + " }");

	for (var i=0;i<rowInfo.months.length;i++) {
		this.handleWatermarks(pageSize.media == "screen", i, rowInfo.months[i], monthdivs[i]);
	}
}

Styling.prototype.insertRuleIntoSheets = function(sheets, rule) {
	for (var i=0;i<sheets.length;i++) {
		sheets[i].insertRule(rule);
	}
}

Styling.prototype.handleWatermarks = function(forScreen, idx, rowInfo, monthdiv) {
	var availx, availy;
	var usedx, usedy, scale, fontSize;
	var sheet;

	if (forScreen) {
		sheet = this.screenSheet;
		availx = monthdiv.clientWidth;
		availy = monthdiv.clientHeight;

		var ruleIdx = sheet.insertRule(".watermark-" +  idx + "{ font-size: " + this.metricFontSize + "pt; }");
		var adiv = monthdiv.querySelector(".watermark");
		var width = adiv.clientWidth;
		var height = adiv.clientHeight;
		
		var scalex = availx/width;
		var scaley = availy/height;
		scale = Math.min(scalex, scaley) * .75; // .75 to leave some space around the edges
		sheet.deleteRule(ruleIdx);
		fontSize = this.metricFontSize*scale;
		ruleIdx = sheet.insertRule(".watermark-" +  idx + "{ font-size: " + fontSize + "pt; }");
		
		var adiv = monthdiv.querySelector(".watermark");
		usedx = adiv.clientWidth;
		usedy = adiv.clientHeight;

		this.screenWatermarks[idx] = { scale, width, height };
		sheet.deleteRule(ruleIdx);
	} else {
		sheet = this.printSheet;
		availx = monthdiv.clientWidth;
		availy = monthdiv.clientHeight;
		var sw = this.screenWatermarks[idx];
		var scalex = availx / sw.width;
		var scaley = availy / sw.height;
		scale = Math.min(scalex, scaley) * .75;
		usedx = sw.width * scale;
		usedy = sw.height * scale;
		fontSize = this.metricFontSize*scale*sw.scale;
	}

	var left = (availx - usedx) / 2;
	var top = (availy - usedy) / 2;

	sheet.insertRule(".watermark-" +  idx + "{ font-size: " + scale*this.metricFontSize + "pt; left: " + left + "px; top: " + top + "px; }");
}

Styling.prototype.calculateSizeOfFeedbackDiv = function() {
	var borderX = 1, borderY = 1;
	var viewx = window.innerWidth;
	var viewy = window.innerHeight;

	var fbx = viewx - 16 - borderX * 2; // 16 for double body margin
	var fby = viewy - this.controlPane.clientHeight - this.optionsDrawer.clientHeight - 16 - borderY * 2;

	var sz = { media: "screen", margin: 0, x : fbx, y : fby, unitIn: "px", borderX, borderY };
	return sz;
}

Styling.prototype.calculatePaperSize = function() {
	var currentSize = this.pageSizer.value;
	var andLandscape = this.isLandscape.checked;
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
		var tmp = ret.borderX;
		ret.borderX = ret.borderY;
		ret.borderY = tmp;
	}
	return ret;
}

export { Styling };
