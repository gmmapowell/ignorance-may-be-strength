function loadICS() {
	var urlEntry = document.getElementById("ics-url");
	var url = urlEntry.value;
	ajax(url, (status, response) => handleICS(url, status, response));
}

function handleICS(url, status, response) {
	console.log("ajax returned status", status);
	if (status / 100 == 2) { 
		var lines = joinLongLines(response.split(/\r\n/));
		var blocked = makeHierarchical(lines);
		if (blocked) {
			var table = makeTabular(blocked);
			addCalendar(url, table);
			redraw();
		}
	} else {
		// TODO: handle status error cases somehow (e.g. 401, 404, 500)
		console.log("error status", status);
		console.log(response);
	}
}

function joinLongLines(lines) {
	var i=0;
	var ret = [];
	while (i < lines.length) {
		var s = lines[i];
		while (++i < lines.length && lines[i].startsWith(" ")) {
			s += lines[i].substring(1);
		}
		ret.push(s);
	}
	return ret;
}

function makeHierarchical(lines) {
	var ret = { type: "VCALENDAR", blocks: [], fields: {} };
	if (lines[0] != "BEGIN:VCALENDAR") {
		console.log("not a calendar"); // errors
		return null;
	}
	var curr = ret;
	var stack = [ ];
	for (var i=1;i<lines.length && lines[i] != "END:VCALENDAR";i++) {
		var kv = lines[i].split(/:/);
		if (kv[0] == "BEGIN") {	
			var next = { type: kv[1], blocks: [], fields: {} };
			curr.blocks.push(next);
			stack.push(curr);
			curr = next;
		} else if (kv[0] == "END") {
			if (kv[1] != curr.type) {
				console.log("line",i,"mismatched BEGIN",curr.type,"and END",kv[1]);
				return null;
			}
			curr = stack.pop();
		} else {
			curr.fields[kv[0]] = kv[1];
		}
	}
	return ret;
}

function makeTabular(blocks) {
	// This assumes that blocks is a VCALENDAR containing VEVENT objects
	// It will ignore other events

	var ret = {};
	for (var i=0;i<blocks.blocks.length;i++) {
		var b = blocks.blocks[i];
		if (b.type != "VEVENT")
			continue;
		var starts = new Date(Date.parse(toStandard(b.fields["DTSTART"])));
		var date = starts.getFullYear() + "-" + (starts.getMonth()+1).toString().padStart(2, '0') + "-" + starts.getDate().toString().padStart(2, '0');
		var time = starts.getHours().toString().padStart(2, '0') + starts.getMinutes().toString().padStart(2, '0');
		if (!ret[date]) {
			ret[date] = [];
		}
		var entry = { time, summary: b.fields.SUMMARY, fields: b.fields };
		for (var j=0;j<ret[date].length;j++) {
			if (entry.time < ret[date][j].time) {
				ret[date].splice(j, 0, entry);
				entry = null;
				break;
			}
		}
		if (entry) { // was not spliced in, append
			ret[date].push(entry);
		}
	}
	return ret;
}

function toStandard(date) {
	return date.substring(0, 4) + "-" + date.substring(4,6) + "-" + date.substring(6,11) + ":" + date.substring(11,13) + ":" + date.substring(13);
}