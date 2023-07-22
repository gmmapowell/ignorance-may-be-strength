function initSharing() {
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