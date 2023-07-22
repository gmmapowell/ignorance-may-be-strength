var sharingFile;

function initSharing() {
	sharingFile = document.getElementById('sharing-file');
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
}

function loadCalendar(url) {
	ajax(url, (status, response) => handleICS(url, status, response));
}
