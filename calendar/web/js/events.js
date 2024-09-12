function CalEvent(start, time, description, tz, until, ends, category) {
    this.startdate = start;
    this.starttime = time;
    this.description = description;
    this.tz = tz;
    this.until = until;
    this.ends = ends;
    this.category = category;
}

CalEvent.retz = function(events, tz) {
    for (var i=0;i<events.length;i++) {
        events[i].redoTZ(tz);
    }
}

CalEvent.prototype.redoTZ = function(newtz) {
    console.log("redo " + this.startdate + ": " + this.starttime + " in " + this.tz + " into " + newtz);
}

export { CalEvent };