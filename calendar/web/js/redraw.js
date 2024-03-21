import { ajax } from './ajax.js';
import { download } from "./download.js";

function RedrawClz(storage, m, sections, styling) {
	this.storage = storage;
    this.modelProvider = m;
    this.fbdiv = sections['feedback'];
    this.styling = styling;
    this.redrawWhenResized = true;
}

RedrawClz.prototype.mode = function(b) {
	this.redrawWhenResized = b;
}

RedrawClz.prototype.windowResized = function(ev) {
	if (this.redrawWhenResized)
		this.redraw();
}

RedrawClz.prototype.onChange = function(elt) {
	elt.addEventListener('change', () => {
		this.modelProvider.saveState();
		this.styling.saveState();
		this.redraw();
	});
}

RedrawClz.prototype.redraw = function() {
    var model = this.modelProvider.calculate();
    // console.log(JSON.stringify(model));
	this.fbdiv.innerHTML = '';

    var thisMonth = null;
    var monthdivs = [];
    for (var wk = 0; wk < model.weeks.length; wk++) {
        var week = model.weeks[wk];

        // create a div for the whole week
		var weekdiv = document.createElement("div");
		weekdiv.className = "body-week";
		if (week.thisMonth) {
            if (thisMonth == null || week.thisMonth.from == wk) {
                thisMonth = document.createElement("div");
                thisMonth.className = 'namedMonth';
                monthdivs.push(thisMonth);
    
                var watermark = document.createElement("div");
                watermark.classList = 'watermark watermark-' + week.thisMonth.watermarkNo;
                var wktext = document.createTextNode(week.thisMonth.text);
                watermark.appendChild(wktext);
                thisMonth.appendChild(watermark)
                this.fbdiv.appendChild(thisMonth);
            }
			thisMonth.appendChild(weekdiv);
		} else {
			this.fbdiv.appendChild(weekdiv);
		}
        
		for (var i=0;i<7;i++) {		
            var day = week.days[i];

			// create a div for each day, to contain all the aspects we will have
			var daydiv = document.createElement("div");
			daydiv.className = "body-day";
			if (day.shadeMe) {
				daydiv.classList.add('weekend');
			}
			weekdiv.appendChild(daydiv);

			// the first aspect is the date
			var date = document.createElement("div");
			date.className = "body-day-date";
			daydiv.appendChild(date);

			// and set the date text in here
			var dateValue = document.createTextNode(day.cellDate);
			date.appendChild(dateValue);

            var cd = day.highlights;
			if (cd && cd.length) {
				var colorBars = document.createElement("div");
				colorBars.className = "body-day-color-bars";
				daydiv.appendChild(colorBars);
				for (var j=0;j<cd.length;j++) {
					var bar = document.createElement("div");
					var itemNo = "";
					if (j > 0) {
						itemNo = " body-day-color-bar-" + (j+1) + "-of-" + cd.length;
					}
					bar.className = "body-day-color-bar body-day-color-bar-" + cd.length + itemNo + " body-day-color-" + cd[j].color;
					if (cd[j].label) {
						var tx = document.createTextNode(cd[j].label);
						bar.appendChild(tx);
					}
					colorBars.appendChild(bar);
				}
			}

            var toShow = day.toShow;
			if (toShow.length > 0) {
				var events = document.createElement("div");
				events.className = "body-day-events-container";
				daydiv.appendChild(events);

				for (var j=0;j<toShow.length;j++) {
					var event = document.createElement("div");
					event.className = "body-day-event";
					events.appendChild(event);
					var timeText = document.createTextNode(toShow[j].starttime);
					var timeSpan = document.createElement("span");
					timeSpan.className = "body-day-event-time";
					timeSpan.appendChild(timeText);
					event.appendChild(timeSpan);
					var eventText = document.createTextNode(" " + toShow[j].description);
					var eventSpan = document.createElement("span");
					eventSpan.className = "body-day-event-text";
					eventSpan.appendChild(eventText);
					event.appendChild(eventSpan);
				}
			}
		}
    }

	this.styling.fitToPageSize(model.rowInfo, monthdivs);
}

RedrawClz.prototype.saveCurrentCalendar = function(reloadList) {
	var curr = this.modelProvider.calculate();
	var name = this.modelProvider.start.value + "+" + curr.weeks.length + ".caljs";
	var text = JSON.stringify(curr);
    var opts = {};
    opts['x-identity-token'] = this.storage.getToken();
    opts['x-file-name'] = name;
    ajax("/ajax/upload.php", (stat, msg) => this.uploadComplete(stat, msg, reloadList), "application/json", text, "PUT", opts);
}

RedrawClz.prototype.uploadComplete = function(stat, msg, reloadList) {
	console.log("stat =", stat);
	reloadList();
}

RedrawClz.prototype.downloadCurrentCalendar = function() {
	var curr = this.modelProvider.calculate();
	var name = this.modelProvider.start.value + "+" + curr.weeks.length + ".caljs";
	var text = JSON.stringify(curr);
	download(name, text);
}

export { RedrawClz };