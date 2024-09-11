import { CSV } from './csv.js';
import { CalEvent } from './events.js';
import { equalsIgnoringCase } from './utils.js';

function CsvCalendar() {
}

CsvCalendar.parse = function(text) {
    var input = CSV.parse(text);
    var cols = {};
    var hdrs = input[0];
    var dtfmt = null, tmfmt = null;
    var dtcol = null, tmcol = null, desccol = null, tzcol = null, untilcol = null, endcol = null, catcol = null;
    for (var c=0;c<hdrs.length;c++) {
        if (equalsIgnoringCase(hdrs[c], "date"))
            dtcol = c;
        else if (equalsIgnoringCase(hdrs[c], "time"))
            tmcol = c;
        else if (equalsIgnoringCase(hdrs[c], "description"))
            desccol = c;
        else if (equalsIgnoringCase(hdrs[c], "tz"))
            tzcol = c;
        else if (equalsIgnoringCase(hdrs[c], "until"))
            untilcol = c;
        else if (equalsIgnoringCase(hdrs[c], "ends"))
            endcol = c;
        else if (equalsIgnoringCase(hdrs[c], "category"))
            catcol = c;
        else if (equalsIgnoringCase(hdrs[c], "dateformat"))
            dtfmt = c;
        else if (equalsIgnoringCase(hdrs[c], "timeformat"))
            tmfmt = c;
    }

    var dateFormat, timeFormat;
    
    var events = [];
    for (var i=1;i<input.length;i++) {
        var row = input[i];
        if (dtfmt && row[dtfmt])
            dateFormat = row[dtfmt];
        if (tmfmt && row[tmfmt])
            timeFormat = row[tmfmt];
        var date = parseDate(dateFormat, row[dtcol])
        var time = parseTime(timeFormat, row[tmcol]);
        var until = parseDate(dateFormat, row[untilcol]);
        var ends = parseTime(timeFormat, row[endcol]);
        var ev = new CalEvent(date, time, row[desccol], row[tzcol], until, ends, row[catcol]);
        events.push(ev);
    }

    return events;
}

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
            var d = input.substring(s1+1, s2);
            if (d.length == 1) {
                d = "0" + d;
            }
            var m = input.substring(0, s1);
            if (m.length == 1) {
                m = "0" + m;
            }
            return y + "-" + m + "-" + d;
        }
        default: // leave it as it is
            return input;
        }
}

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
            h = h.toString();
            if (h.length == 1) {
                h = "0" + h;
            }
            var m = input.substring(s1+1, s2);
            if (m.length == 1) {
                m = '0' + m;
            }
            return h + m;
        default: // leave it as it is
            input = input.toString();
            while (input.length < 4) {
                input = '0' + input;
            }
            return input;
        }
}

export { CsvCalendar };