import { ModelProvider } from "./model.js";

import { initCalendars } from "./controls.js";
import { Styling } from "./styling.js";
import { initSharing, shareJson, loadJsonFromFile, loadSharedJson } from "./sharing.js";
import { RedrawClz } from "./redraw.js";
import { initICS, loadICS } from "./ics.js";

function init() {
    // First get all the elements from the document
	var start = document.getElementById('start-date');
	var end = document.getElementById('end-date');
	var first = document.getElementById('first-day');
	var fbdiv = document.getElementById('feedback');
	var scdiv = document.getElementById('select-calendars');
	var weekendShadeOption = document.getElementById('shade-weekends');

	var controlPane = document.getElementById('controls');
    var pageSize = document.getElementById('page-size');
    var landscape = document.getElementById('landscape');

    var loadICSElt = document.getElementById("load-ics");
    var shareJsonElt = document.getElementById("share-as-json");
    var sharingFile = document.getElementById("sharing-file");
	var sharingUrl = document.getElementById('sharing-url');
    var loadShared = document.getElementById("load-shared");

    var urlEntry = document.getElementById("ics-url");

    // then create all the model objects
	var calendars = {};
	var colors = {};

    // then create all the actors
    var modelProvider = new ModelProvider(start, end, first, weekendShadeOption, fbdiv, colors, calendars);
	var styler = new Styling(fbdiv, controlPane, pageSize, landscape);
    var redraw = new RedrawClz(modelProvider, fbdiv, styler);
    initCalendars(calendars, scdiv, redraw);
	initSharing(sharingFile, sharingUrl);
    initICS(urlEntry, redraw);
 
    // wire up events
    start.addEventListener("change", () => redraw.redraw());
    end.addEventListener("change", () => redraw.redraw());
    first.addEventListener("change", () => redraw.redraw());
    weekendShadeOption.addEventListener("change", () => redraw.redraw());
    pageSize.addEventListener("change", () => redraw.redraw());
    landscape.addEventListener("change", () => redraw.redraw());

    loadICSElt.addEventListener('click', loadICS);
    shareJsonElt.addEventListener('click', shareJson);
    sharingFile.addEventListener('change', loadJsonFromFile);
    loadShared.addEventListener('click', loadSharedJson);

	addEventListener("beforeprint", ev => redraw.mode(false));
	addEventListener("resize", () => redraw.windowResized());
	addEventListener("afterprint", ev => redraw.mode(true));

    // initialize state
	start.valueAsDate = new Date();
	end.valueAsDate = new Date();

    // ok, show what we've got
	redraw.redraw();
}

globalThis.init = init;