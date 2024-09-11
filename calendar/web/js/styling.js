import { SheetRules, SheetRule } from "./stylesheet.js";

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

	// We need to go through and calculate the layout of everything based on its apparent size on the screen
	// For the screen itself, this is easy ... we just say "what is the size of the screen" and go to it
	this.pageLayout([this.screenSheet], rowInfo, monthdivs, this.calculateSizeOfFeedbackDiv());

	// The problem is that for the printer, we don't get any immediate feedback from the "@media 'print'" sheet,
	// because it doesn't apply.  So I created a "printMeasureSheet" which has *the same dimensions* as the piece of
	// paper we want to print to, but is tagged "@media 'screen'".  We use this to *do* our calculations, but then
	// what we really care about is updating "printSheet".
	document.adoptedStyleSheets = [this.printMeasureSheet]; // for "just now", use a sheet on the screen with the paper dimensions
	this.pageLayout([this.printSheet, this.printMeasureSheet], rowInfo, monthdivs, this.calculatePaperSize());

	// Now that we've done all the measuring, we will "adopt" the screenSheet for the screen and the printSheet for the printer
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

	var sr = new SheetRules();

	if (pageSize.media == "print") {
		var pr = sr.rule("@page");
		pr.property("size", pageSize.x + pageSize.unitIn, pageSize.y + pageSize.unitIn, pageSize.orientation);
		pr.property("margin", pageSize.margin + pageSize.unitIn);
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
	var fr = sr.rule(".feedback");
	fr.property("border-width", pageSize.borderY + pageSize.unitIn, pageSize.borderX + pageSize.unitIn);
	fr.property("width", innerX + pageSize.unitIn);
	fr.property("height", innerY + pageSize.unitIn);
	this.insertRuleIntoSheets(sheets, ".feedback { border-width: " + pageSize.borderY + pageSize.unitIn + " " + pageSize.borderX + pageSize.unitIn +"; width: " + innerX + pageSize.unitIn + "; height: " + innerY + pageSize.unitIn + "; }");
	
	var bdr = sr.rule(".body-day");
	bdr.property("border-width", pageSize.borderY + pageSize.unitIn, pageSize.borderX + pageSize.unitIn);
	bdr.property("width", xday + pageSize.unitIn);
	bdr.property("height", yweek + pageSize.unitIn);
	bdr.property("margin", ymargin + pageSize.unitIn, xmargin + pageSize.unitIn);
	this.insertRuleIntoSheets(sheets, ".body-day { border-width: " + pageSize.borderY + pageSize.unitIn + " " + pageSize.borderX + pageSize.unitIn +"; width: " + xday + pageSize.unitIn + "; height: " + yweek + pageSize.unitIn + "; margin: " + ymargin + pageSize.unitIn + " " + xmargin + pageSize.unitIn + " }");

	var bddr = sr.rule(".body-day-date");
	bddr.property("top", ypos + pageSize.unitIn);
	bddr.property("left", xpos + pageSize.unitIn);
	bddr.property("font-size", dateSize + pageSize.unitIn);
	this.insertRuleIntoSheets(sheets, ".body-day-date { top: " + ypos + pageSize.unitIn + "; left: " + xpos + pageSize.unitIn + "; font-size: " + dateSize + pageSize.unitIn + " }");

	var bde = sr.rule(".body-day-event");
	bde.property("width", xday + pageSize.unitIn);
	this.insertRuleIntoSheets(sheets, ".body-day-event { width: " + xday + pageSize.unitIn + "; }");

	var bdec = sr.rule(".body-day-events-container");
	bdec.property("top", eventsContainerY + pageSize.unitIn);
	bdec.property("font-size", dateSize + pageSize.unitIn);
	this.insertRuleIntoSheets(sheets, ".body-day-events-container { top: " + eventsContainerY + pageSize.unitIn + "; font-size: " + dateSize + pageSize.unitIn + " }");

	for (var i=0;i<rowInfo.months.length;i++) {
		this.handleWatermarks(sr, pageSize.media == "screen", i, rowInfo.months[i], monthdivs[i]);
	}

	console.log(sr);
}

Styling.prototype.insertRuleIntoSheets = function(sheets, rule) {
	for (var i=0;i<sheets.length;i++) {
		sheets[i].insertRule(rule);
	}
}

Styling.prototype.handleWatermarks = function(sr, forScreen, idx, rowInfo, monthdiv) {
	var availx, availy;
	var usedx, usedy, scale, fontSize;
	var sheet;

	if (forScreen) {
		sheet = this.screenSheet;
		availx = monthdiv.clientWidth;
		availy = monthdiv.clientHeight;

		var wm1 = new SheetRule(".watermark-" + idx);
		wm1.property("font-size", this.metricFontSize + "pt");
		wm1.applyTo(this.screenSheet);
		var adiv = monthdiv.querySelector(".watermark");
		var width = adiv.clientWidth;
		var height = adiv.clientHeight;
		
		var scalex = availx/width;
		var scaley = availy/height;
		scale = Math.min(scalex, scaley) * .75; // .75 to leave some space around the edges
		wm1.removeFrom(this.screenSheet);
		
		fontSize = this.metricFontSize*scale;
		var wm2 = new SheetRule(".watermark-" + idx);
		wm2.property("font-size", fontSize + "pt");
		wm2.applyTo(this.screenSheet);
		
		var adiv = monthdiv.querySelector(".watermark");
		usedx = adiv.clientWidth;
		usedy = adiv.clientHeight;

		this.screenWatermarks[idx] = { scale, width, height };
		wm2.removeFrom(this.screenSheet);
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

	var wm = sr.rule(".watermark-" + idx);
	wm.property("font-size", scale*this.metricFontSize + "pt");
	wm.property("left", left + "px");
	wm.property("top", top + "px");
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
	// this.resetVirtualScaleOnMobile();
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

Styling.prototype.resetVirtualScaleOnMobile = function() {
	let viewportmeta = document.querySelector('meta[name="viewport"]');
	viewportmeta.setAttribute("content", "width=device-width, height=device-height, initial-scale=1, minimum-scale=1");
}

export { Styling };
