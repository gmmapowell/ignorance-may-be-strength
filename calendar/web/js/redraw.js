import { ajax } from './ajax.js';
import { download } from "./download.js";
import { AutoWireStorage, ControllerOfType, ElementWithId } from './autowire.js';
import { ModelProvider } from './model.js';
import { Styling } from './styling.js';

function RedrawClz() {
    this.storage = new AutoWireStorage();
    this.modelProvider = new ControllerOfType(ModelProvider);
    this.styling = new ControllerOfType(Styling);
	this.fbdiv = new ElementWithId('feedback');
	this.redrawWhenResized = true;
}

RedrawClz.prototype.init = function() {
	this.handleDroppedPlans(this.fbdiv);
}

RedrawClz.prototype.handleDroppedPlans = function(targetZone) {
    targetZone.addEventListener('dragenter', ev => this.fileDraggedOver(ev));
    targetZone.addEventListener('dragover', ev => this.fileDraggedOver(ev));
    targetZone.addEventListener('drop', ev => this.droppedFile(ev));
}

RedrawClz.prototype.fileDraggedOver = function(ev) {
    ev.preventDefault();
}

RedrawClz.prototype.droppedFile = function(ev) {
    ev.preventDefault();
	var self = this;
    var dt = ev.dataTransfer;
    var files = dt.files;
    console.log(files);
	if (files.length > 0) {
		var blob = files[0];
		blob.text().then(data => {
			console.log(data);
			self.modelProvider.overridePlan(JSON.parse(data));
			self.redraw();
		});
	}
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
		// this.styling.saveState();
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
		if (wk == 0) {
			weekdiv.classList.add("first-body-week");
		}
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
			if (i == 0) {
				daydiv.classList.add("first-body-day");
			}
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
				// var events = document.createElement("div");
				// events.className = "body-day-events-container";
				// daydiv.appendChild(events);

				var placedItems = this.placeItems(toShow);
	
				for (var j=0;j<placedItems.length;j++) {
					var pi = placedItems[j];
					if (!pi)
						continue;

					var idiv = document.createElement("div");
					idiv.className = "diary-row";
					idiv.classList.add("diary-row-" + j);
					daydiv.appendChild(idiv);

					// var event = document.createElement("div");
					// event.className = "body-day-event";
					// events.appendChild(event);
					var timeText;
					if (model.showTz == "SHOW" && pi.start.origtz)
						timeText = document.createTextNode(pi.starttime + " " + pi.start.origtz);
					else if (model.showTz == "FOLSHOW")
						timeText = document.createTextNode(pi.starttime + " " + (pi.start.showTZ ? pi.start.showTZ : ""));
					else
						timeText = document.createTextNode(pi.starttime);
					var timeSpan = document.createElement("span");
					timeSpan.className = "body-day-event-time";
					timeSpan.appendChild(timeText);
					idiv.appendChild(timeSpan);
					var eventText = document.createTextNode(" " + pi.description);
					var eventSpan = document.createElement("span");
					eventSpan.className = "body-day-event-text";
					eventSpan.appendChild(eventText);
					idiv.appendChild(eventSpan);
				}
			}
		}
    }

	this.styling.fitToPageSize(model.rowInfo, monthdivs);
}

RedrawClz.prototype.placeItems = function(todo) {
	if (todo.length >= 11) { // if there are 11 or more events, show the first 12 in the available slots ...
		return todo.slice(0, 11);
	}
	var ret = new Array(11);
	for (var ti=0;ti<todo.length;ti++) {
		var td = todo[ti];
		var choice = this.chooseSlot(td.starttime);
		while (ret[choice])
			choice++;
		if (choice > 10) {
			this.moveBottomsUp(ret);
			choice = 10;
		}
		ret[choice] = td;
	}
	return ret;
}

RedrawClz.prototype.moveBottomsUp = function(ret) {
	for (var i=10;i>=0;i--) {
		if (!ret[i]) {
			break;
		}
	}
	while (i<11) {
		ret[i] = ret[i+1];
		i++;
	}
}

RedrawClz.prototype.chooseSlot = function(when) {
	var w = parseInt(when);
	// if (w < 800) return 0;
	if (w < 1300) return 0;
	if (w < 1800) return 4;
	if (w < 2030) return 7;
	return 10;
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
	reloadList();
}

RedrawClz.prototype.downloadCurrentCalendar = function() {
	var curr = this.modelProvider.calculate();
	var name = this.modelProvider.start.value + "+" + curr.weeks.length + ".caljs";
	var text = JSON.stringify(curr);
	download(name, text);
}

export { RedrawClz };