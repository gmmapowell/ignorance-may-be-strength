import { CSV } from './csv.js';
import { CalDateTime, CalEvent, ChangeTZ } from './events.js';
import { equalsIgnoringCase } from './utils.js';

function CsvCalendar() {
}

CsvCalendar.parse = function(text, deftz) {
    var input = CSV.parse(text);
    var hdrs = input[0];
    var dtfmt = null, tmfmt = null;
    var dtcol = null, tmcol = null, desccol = null, tzcol = null, untilcol = null, endcol = null, catcol = null, newtz = null;
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
        else if (equalsIgnoringCase(hdrs[c], "newtz"))
            newtz = c;
    }

    var dateFormat = "isodash", timeFormat = "24h";
    
    var events = [];
    var timezones = [];
    for (var i=1;i<input.length;i++) {
        var row = input[i];
        if (dtfmt && row[dtfmt])
            dateFormat = row[dtfmt];
        if (tmfmt && row[tmfmt])
            timeFormat = row[tmfmt];
        // var date = parseDate(dateFormat, row[dtcol])
        // var time = parseTime(timeFormat, row[tmcol]);
        // var until = parseDate(dateFormat, row[untilcol]);
        // var ends = parseTime(timeFormat, row[endcol]);
        var etz = row[tzcol];
        if (!etz)
            etz = deftz;

        var evfrom = CalDateTime.custom(dateFormat, timeFormat, etz, row[dtcol], row[tmcol]);
        var evto = CalDateTime.custom(dateFormat, timeFormat, etz, row[untilcol], row[endcol]);
        var ev = new CalEvent(evfrom, evto, row[desccol], row[catcol]);
        events.push(ev);

        var ntz = row[newtz];
        if (ntz) {
            var ctzev = new ChangeTZ(evto || evfrom, ntz);
            timezones.push(ctzev);
        }
    }

    return { events, timezones };
}

export { CsvCalendar };