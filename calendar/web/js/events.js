
/* My own notion of how to handle date/time pairs that is aligned with what this project needs.
*/
function CalDateTime(origtz, jsd) {
    this.origtz = origtz;
    this.jsd = jsd;
}

CalDateTime.tzjs = function(tz, jsd) {
    var ret = new CalDateTime(tz, jsd);
    // console.log("processing " + jsd + " => " + ret.dateString() + " : " + ret.timeString() + " / " + tz);
    // console.log("        is " + ret.dateString("EDT") + " : " + ret.timeString("EDT") + " / EDT");
    // console.log("        is " + ret.dateString("BST") + " : " + ret.timeString("BST") + " / BST");
    // console.log("        is " + ret.dateString("NZT") + " : " + ret.timeString("NZT") + " / NZT");
    return ret;
}

CalDateTime.icsDate = function(tz, ics) {
    var ret = CalDateTime.standard(tz, toStandard(ics));
    // console.log("processing " + ics + " => " + ret.dateString() + " : " + ret.timeString() + " / " + tz);
    // console.log("        is " + ret.dateString("EDT") + " : " + ret.timeString("EDT") + " / EDT");
    // console.log("        is " + ret.dateString("BST") + " : " + ret.timeString("BST") + " / BST");
    // console.log("        is " + ret.dateString("NZT") + " : " + ret.timeString("NZT") + " / NZT");
    return ret;
}

CalDateTime.standard = function(tz, std) {
    var ret = CalDateTime.tzjs(tz, new Date(Date.parse(std)));
    return ret;
}

CalDateTime.custom = function(df, tf, tz, date, time) {
    if (!date || !time)
        return null;
    var dt = parseDate(df, date);
    var tm = parseTime(tf, time);
    var utc = new Date(Date.UTC(dt[0], dt[1]-1, dt[2], tm[0], tm[1]));
    var tzd = applyTimezone(findTZ(tz), utc)
    var ret = new CalDateTime(tz, tzd);
    // console.log("processing " + date + " " + time + " => " + ret.dateString() + " : " + ret.timeString() + " / " + tz);
    // console.log("        is " + ret.dateString("EDT") + " : " + ret.timeString("EDT") + " / EDT");
    // console.log("        is " + ret.dateString("BST") + " : " + ret.timeString("BST") + " / BST");
    // console.log("        is " + ret.dateString("NZT") + " : " + ret.timeString("NZT") + " / NZT");
    return ret;
}

CalDateTime.prototype.dateString = function(intz) {
    // 15/03/2025, 19:30:00
    var tz = this.tzToUse(intz); // (intz && intz != "SHOW") ? findTZ(intz) : findTZ(this.origtz);
    var gbfmt = this.jsd.toLocaleString('en-GB', { timeZone: tz, hour12: false });
    var yr = gbfmt.substring(6, 10);
    var mth = gbfmt.substring(3, 5);
    var day = gbfmt.substring(0, 2);
    return yr + "-" + mth + "-" + day;
}

CalDateTime.prototype.timeString = function(intz) {
    var tz = this.tzToUse(intz); // (intz && intz != "SHOW") ? findTZ(intz) : findTZ(this.origtz);
    var gbfmt = this.jsd.toLocaleString('en-GB', { timeZone: tz, hour12: false });
    var hr = gbfmt.substring(12, 14);
    var min = gbfmt.substring(15, 17);
    return hr + min;
}

CalDateTime.prototype.tzToUse = function(intz) {
    if (!intz || intz == "SHOW")
        return findTZ(this.origtz);
    else
        return findTZ(intz);
}

function findTZ(tz) {
    if (tz.includes("/"))
        return tz;
    switch (tz) {
        case "UTC":
            return tz;
        case "ET":
        case "EDT":
        case "EST":
            return "America/New_York";
        case "GMT":
        case "BST":
            return "Europe/London";
        case "NZT":
            return "Pacific/Auckland";
        default:
            throw new Error("not handled time zone: " + tz);
    }
}

function toStandard(date) {
	return date.substring(0, 4) + "-" + date.substring(4,6) + "-" + date.substring(6,11) + ":" + date.substring(11,13) + ":" + date.substring(13);
}

function CalEvent(start, end, description, category) {
    if (!(start instanceof CalDateTime))
        throw new Error("use CalDateTime");
    this.start = start;
    this.end = end;
    this.description = description;
    this.category = category;
}

CalEvent.retz = function(events, tz) {
    if (tz == "SYSTEM")
        tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    for (var i=0;i<events.length;i++) {
        events[i].redoTZ(tz);
    }
}

CalEvent.prototype.redoTZ = function(newtz) {
    // console.log("change time zone", this.start.jsd, "in", this.start.origtz, "into", newtz);
    this.startdate = this.start.dateString(newtz);
    this.starttime = this.start.timeString(newtz);
    if (this.end) {
        this.until = this.end.dateString(newtz);
        this.ends = this.end.timeString(newtz);
    }
}

function ChangeTZ(cdt, newtz) {
    this.cdt = cdt;
    this.newtz = newtz;
}

ChangeTZ.comparator = function(a, b) {
    if (a.cdt.jsd == b.cdt.jsd)
        return 0;
    else if (a.cdt.jsd < b.cdt.jsd)
        return -1;
    else
        return 1;
}

// return an array [year, month, day]
function parseDate(fmt, input) {
    if (!input) {
        return "";
    }
    switch (fmt) {
        case "M/D/Y": {
            var s1 = input.indexOf('/');
            var s2 = input.lastIndexOf('/');
            var y = input.substring(s2+1);
            if (y.length == 2) {
                y = "20" + y;
            }
            var m = input.substring(0, s1);
            if (m.length == 1) {
                m = "0" + m;
            }
            var d = input.substring(s1+1, s2);
            if (d.length == 1) {
                d = "0" + d;
            }
            return [y, m, d];
        }
        default:
            var s1 = input.indexOf('-');
            var s2 = input.lastIndexOf('-');
            var y = input.substring(0, s1);
            if (y.length == 2) {
                y = "20" + y;
            }
            var m = input.substring(s1+1, s2);
            if (m.length == 1) {
                m = "0" + m;
            }
            var d = input.substring(s2+1);
            if (d.length == 1) {
                d = "0" + d;
            }
            return [Number(y), Number(m), Number(d)];
        }
}

// return an array [24h, min]
function parseTime(fmt, input) {
    if (!input) {
        return "";
    }
    switch (fmt) {
        case "H:M A":
            var s1 = input.indexOf(':');
            var s2 = input.indexOf(' ');
            var apm = input.substring(input.length-2);
            var h = Number(input.substring(0, s1));
            if (apm == "PM" && h != 12) {
                h += 12;
            } else if (apm == "AM" && h == 12) {
                h = 0;
            }
            var m = input.substring(s1+1, s2);
            return [h, Number(m)];
        default:
            input = input.toString();
            while (input.length < 4) {
                input = '0' + input;
            }
            return [Number(input.substring(0, 2)), Number(input.substring(2,4))];
        }
}

function applyTimezone(tz, date) {
    const tzString = date.toLocaleString('en-US', { timeZone: tz });
    const localString = date.toLocaleString('en-US', { timeZone: "UTC" });
    const diff = (Date.parse(tzString) - Date.parse(localString)) / 3600000;
    date.setHours(date.getHours() - diff);
    return date;
}
  
export { CalDateTime, CalEvent, ChangeTZ };