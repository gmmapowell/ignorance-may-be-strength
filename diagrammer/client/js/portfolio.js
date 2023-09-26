import { clickFor } from "./jstda.js";
import DiagramModel from "./model/diagram.js";
import { selectDiagramTab, selectTab } from "./tabbing.js";

class Portfolio {
	constructor(errors) {
		this.errors = errors;
		this.diagrams = [];
		this.tabs = {};
	}

	createDiagram(named) {
		var ret = new DiagramModel(this.errors);
		this.diagrams.push({named, diagram: ret });
		return ret;
	}

	ensureTabs(tabrow, tabdisplay) {
		this.tabs = {};
		var titles = tabrow.querySelectorAll(".diagram-tab");
		var bodies = tabdisplay.querySelectorAll(".diagram-tab");
		var toRemove = [];
		for (var i=0;i<titles.length;i++) {
			toRemove[titles[i].dataset["diagramFor"]] = { title: titles[i], body: bodies[i] };
		}
		for (var i=0;i<this.diagrams.length;i++) {
			var d = this.diagrams[i];
			var t = findTabFor(titles, d.named);
			var b = findTabFor(bodies, d.named);
			if (!t) {
				t = addDiagramTab(tabrow, tabdisplay, d.named);
			} else {
				delete toRemove[d.named];
				t = { title: t, diagram: b };
			}
			this.tabs[d.named] = t;
		}
		var keys = Object.keys(toRemove);
		for (var i=0;i<keys.length;i++) {
			tabrow.removeChild(toRemove[keys[i]]);
		}
	}

	each(f) {
		for (var i=0;i<this.diagrams.length;i++) {
			var d = this.diagrams[i];
			f(d.named, d.diagram, this.tabs[d.named].diagram);
		}
	}
}

function findTabFor(tabs, name) {
	for (var i=0;i<tabs.length;i++) {
		var t = tabs[i];
		if (t.dataset["diagramFor"] == name) {
			return t;
		}
	}
}

function addDiagramTab(titles, display, name) {
	var t = document.createElement("div");
	t.className = "diagram-tab tab-title";
	t.dataset["diagramFor"] = name;
	t.appendChild(document.createTextNode(name));
	titles.appendChild(t);
	clickFor(ev => selectDiagramTab(name)) (t);

	var d = document.createElement("div");
	d.className = "diagram-tab tab-body";
	d.dataset["diagramFor"] = name;
	var cd = document.createElement("div");
	var c = document.createElement("canvas");
	c.className="diagram";
	c.setAttribute("width", "1200");
	c.setAttribute("height", "800");
	cd.appendChild(c);
	d.appendChild(cd);
	display.appendChild(d);

	return { title: t, diagram: d };
 }

export default Portfolio;