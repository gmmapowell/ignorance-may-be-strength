import { ElementWithId } from "./autowire.js";
import { SheetRules, SheetRule } from "./stylesheet.js";

// all of these should be false in the wild
// they are here to make debugging easier
const screenOnly = false;
const testingPrinter = false;
const feedbackBorder = false;

function Styling() {
	this.styledDiv = new ElementWithId('feedback');
	this.controlPane = new ElementWithId('controls');
	this.optionsDrawer = new ElementWithId('options-drawer');
	this.pageSizer = new ElementWithId('page-size', 'value').storedAs('print', 'size', 'a4');
	this.isLandscape = new ElementWithId('landscape', 'checked').storedAs('print', 'landscape', false);

	this.screenSheet = new CSSStyleSheet({ media: "screen" });
	this.screenLayout = new SheetRules(this.screenSheet);

	this.printSheet = new CSSStyleSheet({ media: "print" });
	this.printMeasureSheet = new CSSStyleSheet({ media: "screen" });
	this.printLayout = new SheetRules(this.printSheet, this.printMeasureSheet);

	this.metricFontSize = 10;
	this.screenWatermarks = {};
	document.adoptedStyleSheets = [this.screenSheet, this.printSheet];

	this.pageInfo = null;
}

Styling.prototype.reset = function() {
	this.pageSizer.value = "a4";
	this.isLandscape.checked = false;
}

Styling.prototype.fitToPageSize = function(rowInfo, monthdivs) {
	this.screenWatermarks = {};

	// We need to go through and calculate the layout of everything based on its apparent size on the screen
	// For the screen itself, this is easy ... we just say "what is the size of the screen" and go to it
	this.pageInfo = this.pageLayout(this.screenLayout, rowInfo, monthdivs, this.calculateSizeOfFeedbackDiv());

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
	var rowPosns = [];
	var colPosns = [];

	// if (pageSize.media != 'print')
	// 	console.log("laying out screen into", pageSize);
	var rows = rowInfo.numRows;

	var innerX = pageSize.x, innerY = pageSize.y;

	sr.clear();

	if (pageSize.media == "print") {
		var pr = sr.rule("@page");
		pr.property("size", pageSize.x + pageSize.unitIn, pageSize.y + pageSize.unitIn, pageSize.orientation);
		// margin doesn't seem to work, but maybe because I've turned it off in the print dialog
		pr.property("margin", "0mm");

		innerX -= 2 * pageSize.margin;
		innerY -= 2 * pageSize.margin;
	}

	// calculate desired box sizes
	// horizontally, we divide the space up into 7 days, each of which has:
	//   a left and right border
	//   a left margin (except the leftmost - so only six margins)
	//   and then is divided up into 12 segments
	var bx = 2 * 7 * pageSize.borderX;
	// It seems that for the printer, we can't have a size < 1
	if (bx < 14)
		bx = 14;
	var xnoborder = innerX - bx;
	var xunit = xnoborder / (7 * 13 - 1);
	// console.log(pageSize.media, "xs", innerX, xnoborder, xunit);

	// the internal space is 12 unit segments
	var xday = floor(pageSize.unitIn, xunit*12);

	// each of the left and right margins is the same size as .5 the unit, so they combine to make one
	var xmargin = floor(pageSize.unitIn, xunit);
	// console.log("x =", 7*xday+6*xmargin + bx);

	// record for inversion
	var xp = 0;
	for (var xi=0;xi<7;xi++) {
		var end = xp + 2 * pageSize.borderX + xday;
		colPosns.push({ from: xp, to: end });
		xp = end + xmargin;
	}

	// vertically, we have #rows rows and (#rows-1) gaps
	// the height of each week is 13 units, 12 internally and 1 making up the margins.
	// thus there are a total of 13*#rows-1 units

	// first take off 2*#rows borders (as well as the outer border)
	var ynoborder = innerY - pageSize.borderY * 2 * rows;
	// console.log("ynob =", ynoborder);

	// then divide up into units
	var divby = rows*13-1;
	// console.log("divby = ", divby);
	var yunit = ynoborder / divby;
	// if (pageSize.media != 'print')
	// 	console.log("yunit = ", yunit);

	// the week itself consists of 12 units
	var yweek = floor(pageSize.unitIn, yunit*12);
	// if (pageSize.media != 'print')
	// 	console.log("yweek =", yweek);

	// and the margin is half a unit, so two of them together is again a unit
	var ymargin = yunit;
	
	// record for inversion
	var yp = 0;
	for (var yi=0;yi<rows;yi++) {
		var end = yp + 2 * pageSize.borderY + yweek;
		rowPosns.push({ from: yp, to: end });
		yp = end + ymargin;
	}

	var dateSize = Math.min(xunit, yunit);

	// generate new rules
	var fr = sr.rule(".feedback");
	if (feedbackBorder) {
		fr.property("border-width", pageSize.borderY + pageSize.unitIn, pageSize.borderX + pageSize.unitIn);
		fr.property("border-color", "black");
		fr.property("border-style", "solid");
	}
	fr.property("padding", pageSize.borderY + pageSize.unitIn, pageSize.borderX + pageSize.unitIn);
	fr.property("width", innerX + pageSize.unitIn);
	fr.property("height", innerY + pageSize.unitIn);
	fr.property("margin", pageSize.margin + pageSize.unitIn);

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

	for (var i=0;i<11;i++) {
		var ir = sr.rule(".diary-row-" + i);
		ir.property("top", (yunit*(i+1)) + pageSize.unitIn);
		ir.property("height", yunit + pageSize.unitIn);
		ir.property("font-size", dateSize + pageSize.unitIn);
	}

	var bde = sr.rule(".body-day-event");
	bde.property("width", xday + pageSize.unitIn);

	sr.apply();

	for (var i=0;i<rowInfo.months.length;i++) {
		this.handleWatermarks(sr, pageSize.media == "screen", i, monthdivs[i]);
	}

	return { rowPosns, colPosns };
}

Styling.prototype.handleWatermarks = function(sr, forScreen, idx, monthdiv) {
	var availx, availy;
	var usedx, usedy, scale, fontSize;

	if (forScreen) {
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

	// console.log("inside window is", viewx, viewy);

	var fbx = viewx - borderX * 2; // 16 for double body margin
	// console.log("y-subtract", marginHeight(this.controlPane), marginHeight(this.optionsDrawer), borderY*2);
	var fby = viewy - marginHeight(this.controlPane) - marginHeight(this.optionsDrawer) - borderY * 2;

	// console.log("calculated area is", fbx, fby);

	var sz = { media: "screen", margin: 0, x : fbx, y : fby, unitIn: "px", borderX, borderY };
	return sz;
}

Styling.prototype.calculatePaperSize = function() {

	if (testingPrinter) {
		return { media: "print", margin: 6, orientation: "portrait", x : 297, y : 210, unitIn: "px", borderX: 0.1, borderY: 0.1 };

	}
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
			ret = { media: "print", margin: 13, orientation: "portrait", x : 297, y : 420, unitIn: "mm", borderX: 0.1, borderY: 0.1 };
			break;
		case "a4":
		default: /* use A4 as default, just in case */
			ret = { media: "print", margin: 13, orientation: "portrait", x : 210, y : 297, unitIn: "mm", borderX: 0.1, borderY: 0.1 };
			break;
	}
	if (andLandscape) {
		var tmp = ret.x;
		ret.x = ret.y;
		ret.y = tmp;
		var tmp = ret.borderX;
		ret.borderX = ret.borderY;
		ret.borderY = tmp;
		ret.orientation = 'landscape';
	}
	return ret;
}

Styling.prototype.resetVirtualScaleOnMobile = function() {
	let viewportmeta = document.querySelector('meta[name="viewport"]');
	viewportmeta.setAttribute("content", "width=device-width, height=device-height, initial-scale=1, minimum-scale=1");
}

Styling.prototype.invert = function(feedbackX, feedbackY) {
	// console.log("finding", feedbackX, feedbackY, "in", this.pageInfo);
	var xf = -1, yf = -1;
	for (var xi=0;xi<7;xi++) {
		var xp = this.pageInfo.colPosns[xi];
		if (feedbackX >= xp.from && feedbackX <= xp.to) {
			xf = xi;
		}
	}
	for (var yi=0;yi<this.pageInfo.rowPosns.length;yi++) {
		var yp = this.pageInfo.rowPosns[yi];
		if (feedbackY >= yp.from && feedbackY <= yp.to) {
			yf = yi;
		}
	}
	if (xf >= 0 && yf >= 0) {
		return { x: xf, y: yf };
	}
}

function floor(unit, quant) {
	if (unit == 'px')
		return Math.floor(quant);
	else if (unit == 'mm' || unit == 'in')
		return Math.floor(quant*10)/10.0;
	else
		console.log("what is unit " + unit);
}

function marginHeight(elm) {
	var eh = elm.clientHeight;
	// console.log("elmh", elm, eh);
	if (eh == 0) { // it's not visible ...
		return 0;
	}
	var mt = parseFloat(document.defaultView.getComputedStyle(elm, '').getPropertyValue('margin-top'));
	var mb = parseFloat(document.defaultView.getComputedStyle(elm, '').getPropertyValue('margin-bottom'));
    return (eh+mt+mb);
}

export { Styling };
