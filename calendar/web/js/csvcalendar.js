import { CSV } from './csv.js';
import { CalEvent } from './events.js';

function CsvCalendar() {
}

CsvCalendar.parse = function(text) {
    var input = CSV.parse(text);
    var cols = {};
    var hdrs = input[0];
    for (var c=0;c<hdrs.length;c++) {
        cols[hdrs[c]] = c;
    }
    
    var events = [];
    for (var i=1;i<input.length;i++) {
        var row = input[i];
        var ev = new CalEvent(row[cols['Date']], row[cols['Time']], row[cols['Description']]);
        events.push(ev);
    }

    return events;
}

export { CsvCalendar };