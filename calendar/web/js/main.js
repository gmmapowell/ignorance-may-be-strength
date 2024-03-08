import { initCalendars } from "./controls.js";
import { initStyling } from "./styling.js";
import { initSharing, shareJson, loadJsonFromFile, loadSharedJson } from "./sharing.js";
import { initRedraw, redrawOnResize, redraw, redrawMode } from "./redraw.js";
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

    start.addEventListener("change", redraw);
    end.addEventListener("change", redraw);
    first.addEventListener("change", redraw);
    weekendShadeOption.addEventListener("change", redraw);
    pageSize.addEventListener("change", redraw);
    landscape.addEventListener("change", redraw);

    loadICSElt.addEventListener('click', loadICS);
    shareJsonElt.addEventListener('click', shareJson);
    sharingFile.addEventListener('change', loadJsonFromFile);
    loadShared.addEventListener('click', loadSharedJson);

	start.valueAsDate = new Date();
	end.valueAsDate = new Date();

    initCalendars(calendars, scdiv);
    initRedraw(start, end, first, weekendShadeOption, fbdiv, colors, calendars);
	initStyling(fbdiv, controlPane, pageSize, landscape, canvas);
	initSharing(sharingFile, sharingUrl);
    initICS(urlEntry);

	addEventListener("beforeprint", ev => redrawMode(false));
	addEventListener("resize", redrawOnResize);
	addEventListener("afterprint", ev => redrawMode(true));
	redraw();
}

globalThis.init = init;