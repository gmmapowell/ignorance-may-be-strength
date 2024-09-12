import { SheetRules, SheetRule } from "./stylesheet.js";

// both of these should be false in the wild
// they are here to make debugging easier
const screenOnly = true;
const testingPrinter = false;

function Styling(storage, sections, print) {
	this.storage = storage;
	this.styledDiv = sections['feedback'];
	this.controlPane = sections['controls'];
	this.optionsDrawer = sections['options-drawer'];
	this.pageSizer = print['page-size'];
	this.isLandscape = print['landscape'];

	this.screenSheet = new CSSStyleSheet({ media: "screen" });
	this.screenLayout = new SheetRules(this.screenSheet);

	this.printSheet = new CSSStyleSheet({ media: "print" });
	this.printMeasureSheet = new CSSStyleSheet({ media: "screen" });
	this.printLayout = new SheetRules(this.printSheet, this.printMeasureSheet);

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
	this.pageLayout(this.screenLayout, rowInfo, monthdivs, this.calculateSizeOfFeedbackDiv());

	// The problem is that for the printer, we don't get any immediate feedback from the "@media 'print'" sheet,
	// because it doesn't apply.  So I created a "printMeasureSheet" which has *the same dimensions* as the piece of
	// paper we want to print to, but is tagged "@media 'screen'".  We use this to *do* our calculations, but then
	// what we really care about is updating "printSheet".
	if (!screenOnly || testingPrinter) {
		document.adoptedStyleSheets = [this.printMeasureSheet]; // for "just now", use a sheet on the screen with the paper dimensions
		this.pageLayout(this.printLayout, rowInfo, monthdivs, this.calculatePaperSize());
	}

	// Now that we've done all the measuring, we will "adopt" the screenSheet for the screen and the printSheet for the printer
	if (testingPrinter) {
		// if we are testing the print layout, adopt the "printMeasureSheet" instead of the screenSheet;
		// screen and printer should then be "identical"
		document.adoptedStyleSheets = [this.printMeasureSheet, this.printSheet];
	} else {
		document.adoptedStyleSheets = [this.screenSheet, this.printSheet];
	}
}

Styling.prototype.pageLayout = function(sr, rowInfo, monthdivs, pageSize) {
	var rows = rowInfo.numRows;

	var innerX = pageSize.x, innerY = pageSize.y;
	console.log("pagesize = ", pageSize);
	// var hackX = 1;

	sr.clear();

	if (pageSize.media == "print") {
		var pr = sr.rule("@page");
		pr.property("size", pageSize.x + pageSize.unitIn, pageSize.y + pageSize.unitIn, pageSize.orientation);
		pr.property("margin", pageSize.margin + pageSize.unitIn);
		// innerX -= 3 * pageSize.margin;
		// innerY -= 5 * pageSize.margin; // I feel this should be 2, but that doesn't work, so I ended up with 5.  Maybe at some point I will discover what I've missed
		// hackX = 0.95; // removing this while I rework to try and avoid hacks
	}

	// calculate desired box sizes
	// horizontally, we divide the space up into 7 days, each of which has:
	//   a left and right border
	//   a left margin (except the leftmost - so only six margins)
	//   and then is divided up into 12 segments
	var xnoborder = innerX - 2 * 7 * pageSize.borderX;
	var xunit = xnoborder / (7 * 13 - 1);

	// var xday7x13 = innerX / 7;
	// var xunit = (xday7x13 - 2 * pageSize.borderX) / 13;
	// xunit *= hackX; // a hack because I don't understand what causes the printer version to wrap

	// the internal space is 12 unit segments
	var xday = xunit*12;

	// each of the left and right margins is the same size as .5 the unit, so they combine to make one
	var xmargin = xunit;

	// vertically, we have #rows rows and (#rows-1) gaps
	// the height of each week is 13 units, 12 internally and 1 making up the margins.
	// thus there are a total of 13*#rows-1 units

	// first take off 2*#rows borders (as well as the outer border)
	var ynoborder = innerY - pageSize.borderY * 2 * rows;
	console.log("ynob =", ynoborder);

	// then divide up into units
	var divby = rows*13-1;
	console.log("divby = ", divby);
	var yunit = ynoborder / divby;
	console.log("yunit = ", yunit);

	// the week itself consists of 12 units
	var yweek = yunit*12;
	console.log("yweek =", yweek);

	// and the margin is half a unit, so two of them together is again a unit
	var ymargin = yunit;
	var ypos = yweek / 5;
	
	var dateSize = Math.min(xunit, yunit);

	var eventsContainerY = 2 * ypos;

	// generate new rules
	var fr = sr.rule(".feedback");
	fr.property("border-width", pageSize.borderY + pageSize.unitIn, pageSize.borderX + pageSize.unitIn);
	fr.property("border-color", "black");
	fr.property("border-style", "solid");
	fr.property("padding", pageSize.borderY + pageSize.unitIn, pageSize.borderX + pageSize.unitIn);
	fr.property("width", innerX + pageSize.unitIn);
	fr.property("height", innerY + pageSize.unitIn);

	var bwr = sr.rule(".body-week");
	bwr.property("height", (yweek + 2*pageSize.borderY) + pageSize.unitIn);
	bwr.property("margin-top", ymargin + pageSize.unitIn);

	var bdr = sr.rule(".body-day");
	bdr.property("border-width", pageSize.borderY + pageSize.unitIn, pageSize.borderX + pageSize.unitIn);
	bdr.property("width", xday + pageSize.unitIn);
	bdr.property("height", yweek + pageSize.unitIn);
	bdr.property("margin-left", xmargin + pageSize.unitIn);

	var bddr = sr.rule(".body-day-date");
	bddr.property("top", (yunit/5) + pageSize.unitIn);
	bddr.property("left", (xunit/2) + pageSize.unitIn);
	bddr.property("font-size", dateSize + pageSize.unitIn);

	var bde = sr.rule(".body-day-event");
	bde.property("width", xday + pageSize.unitIn);

	var bdec = sr.rule(".body-day-events-container");
	bdec.property("top", eventsContainerY + pageSize.unitIn);
	bdec.property("font-size", dateSize + pageSize.unitIn);

	sr.apply();

	for (var i=0;i<rowInfo.months.length;i++) {
		this.handleWatermarks(sr, pageSize.media == "screen", i, rowInfo.months[i], monthdivs[i]);
	}

	// console.log(sr);
	return sr;
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

	sr.apply();
}

Styling.prototype.calculateSizeOfFeedbackDiv = function() {
	var borderX = 1, borderY = 1;
	var viewx = window.innerWidth;
	var viewy = window.innerHeight;

	var fbx = viewx - borderX * 2; // 16 for double body margin
	var fby = viewy - marginHeight(this.controlPane) - marginHeight(this.optionsDrawer) - borderY * 2;

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

function marginHeight(elm) {
	var eh = elm.clientHeight;
	if (eh == 0) { // it's not visible ...
		return 0;
	}
	var mt = parseFloat(document.defaultView.getComputedStyle(elm, '').getPropertyValue('margin-top'));
	var mb = parseFloat(document.defaultView.getComputedStyle(elm, '').getPropertyValue('margin-bottom'));
    return (eh+mt+mb);
}

export { Styling };
