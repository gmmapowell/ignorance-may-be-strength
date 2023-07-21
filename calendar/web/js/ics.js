function loadICS() {
	var urlEntry = document.getElementById("ics-url");
	var url = urlEntry.value;
	ajax(url, handleICS);
}

function handleICS(status, response) {
	console.log("ajax returned status", status);
	if (status / 100 == 2) { 
		var lines = joinLongLines(response.split(/\r\n/));
		var blocked = makeHierarchical(lines);
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