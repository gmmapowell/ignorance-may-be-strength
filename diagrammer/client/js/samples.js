function loadSampleInto(area) {
	var params = new URLSearchParams(window.location.search);
	if (params.has("sample")) {
		switch (params.get("sample")) {
			case "1": {
				area.value = onebox();
				break;
			}
			case "2": {
				area.value = twoboxes();
				break;
			}
			case "3": {
				area.value = threeboxesY();
				break;
			}
		}
	}
}

function onebox() {
	return "" +
		"node producer\n" +
		"    label 'Producer'\n"
	;
}

function twoboxes() {
	return "" +
		"node producer\n" +
		"    label 'Producer'\n" +
		"node consumer\n" +
		"    label 'Consumer'\n" +
		"edge\n" + 
		"    from producer\n" +
		"    to consumer\n"
	;
}

function threeboxesY() {
	return "" +
		"node producer\n" +
		"    label 'Producer'\n" +
		"node consumer\n" +
		"    label 'Consumer'\n" +
		"node observer\n" +
		"    label 'Observer'\n" +
		"edge\n" + 
		"    from producer\n" +
		"    to consumer\n" +
		"edge\n" + 
		"    from producer\n" +
		"    to observer\n"
	;
}

export default loadSampleInto;