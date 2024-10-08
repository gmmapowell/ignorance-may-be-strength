import { CalDateTime, CalEvent } from './events.js';

function Ics() {
}

Ics.parse = function(text, mytz, showtz) {
	var lines = Ics.joinLongLines(text.split(/\r\n/));
	var blocked = Ics.makeHierarchical(lines);
	if (blocked) {
		return Ics.makeEvents(blocked, mytz, showtz);
	} else {
		return null;
	}
}

Ics.joinLongLines = function(lines) {
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

Ics.makeHierarchical = function(lines) {
	var ret = { type: "VCALENDAR", blocks: [], fields: {} };
	if (lines[0] != "BEGIN:VCALENDAR") {
		console.log("not a calendar"); // errors
		return null;
	}
	var curr = ret;
	var stack = [ ];
	for (var i=1;i<lines.length && lines[i] != "END:VCALENDAR";i++) {
		var kv = Ics.split(lines[i]);
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

Ics.split = function(line) {
	var col = line.indexOf(':');
	var semi = line.indexOf(';');
	if (semi != -1 && (col == -1 || semi < col)) {
		return [ line.substring(0, semi), line.substring(semi+1) ];
	} else {
		return [ line.substring(0, col), line.substring(col+1) ];
	}
}

Ics.makeEvents = function(blocks, mytz, showtz) {
	if (!mytz)
		mytz = "UTC";
	// This assumes that blocks is a VCALENDAR containing VEVENT objects
	// It will ignore other events

	// It chooses the "Summary" over the "Description" field; we should possibly read both and allow the user to choose

	var ret = [];
	for (var i=0;i<blocks.blocks.length;i++) {
		var b = blocks.blocks[i];
		if (b.type != "VEVENT")
			continue;
		var ev = new CalEvent(CalDateTime.icsDate(mytz, b.fields["DTSTART"]), CalDateTime.icsDate(mytz, b.fields["DTEND"]), b.fields.SUMMARY, null);
		ret.push(ev);
	}
	return ret;
}

Ics.toStandard = function(date) {
	return date.substring(0, 4) + "-" + date.substring(4,6) + "-" + date.substring(6,11) + ":" + date.substring(11,13) + ":" + date.substring(13);
}

export { Ics };