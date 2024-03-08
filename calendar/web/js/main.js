import { ModelProvider } from "./model.js";

import { initCalendars } from "./controls.js";
import { initStyling } from "./styling.js";
import { initSharing, shareJson, loadJsonFromFile, loadSharedJson } from "./sharing.js";
import { RedrawClz } from "./redraw.js";
import { initICS, loadICS } from "./ics.js";

function init() {
	var start = document.getElementById('start-date');
	var end = document.getElementById('end-date');
	var first = document.getElementById('first-day');
	var fbdiv = document.getElementById('feedback');
	var scdiv = document.getElementById('select-calendars');
	var weekendShadeOption = document.getElementById('shade-weekends');

	var controlPane = document.getElementById('controls');
    var pageSize = document.getElementById('page-size');
    var landscape = document.getElementById('landscape');
	var canvas = document.getElementById("canvas");

    var loadICSElt = document.getElementById("load-ics");
    var shareJsonElt = document.getElementById("share-as-json");
    var sharingFile = document.getElementById("sharing-file");
	var sharingUrl = document.getElementById('sharing-url');
    var loadShared = document.getElementById("load-shared");

    var urlEntry = document.getElementById("ics-url");

	var calendars = {};
	var colors = {};

    var modelProvider = new ModelProvider(start, end, first, weekendShadeOption, fbdiv, colors, calendars);
    var redraw = new RedrawClz(modelProvider, fbdiv);
 
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

	start.valueAsDate = new Date();
	end.valueAsDate = new Date();

    initCalendars(calendars, scdiv, redraw);
	initStyling(fbdiv, controlPane, pageSize, landscape, canvas);
	initSharing(sharingFile, sharingUrl);
    initICS(urlEntry, redraw);

	addEventListener("beforeprint", ev => redraw.mode(false));
	addEventListener("resize", () => redraw.windowResized());
	addEventListener("afterprint", ev => redraw.mode(true));
	redraw.redraw();
}

globalThis.init = init;