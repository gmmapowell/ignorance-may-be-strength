import { ajax } from "./ajax.js";

var sharingFile, sharingURL;

function initSharing(f, u) {
	sharingFile = f;
	sharingURL = u;
	readConfigFromParameter();
}

function shareJson() {
	download("share-calendar.json", JSON.stringify(assemblePropertiesObject()));
}

function assemblePropertiesObject() {
	return {
		start: start.value,
		end: end.value,
		firstDay: first.value,
		calendars: Object.keys(calendars)
	};
}

function loadJsonFromFile() {
	sharingFile.files[0].text().then(tx => configureWith(JSON.parse(tx)));
}

function configureWith(json) {
	start.value = json.start;
	end.value = json.end;
	first.value = json.firstDay;
	for (var i=0;i<json.calendars.length;i++) {
		loadCalendar(json.calendars[i]);
	}
	if (json.colors) {
		for (var i=0;i<json.colors.length;i++) {
			colorRange(json.colors[i]);
		}
	}
}

function loadCalendar(url) {
	ajax(url, (status, response) => handleICS(url, status, response));
}

function loadSharedJson() {
	var from = sharingURL.value;
	ajax(from, handleConfig);
}

function handleConfig(status, response) {
	if (status / 100 == 2) {
		configureWith(JSON.parse(response));
	} else {
		console.log(status, response);
	}
}

function readConfigFromParameter() {
	var params = new URLSearchParams(window.location.search);
	if (params.has("config")) {
		ajax(params.get("config"), handleConfig);
	}
}

export { initSharing, shareJson, loadJsonFromFile, loadSharedJson };
