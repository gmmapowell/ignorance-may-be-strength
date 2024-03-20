function CalEvent(start, time, description, tz, until, ends, category) {
    this.startdate = start;
    this.starttime = time;
    this.description = description;
    this.tz = tz;
    this.until = until;
    this.ends = ends;
    this.category = category;
}

export { CalEvent };