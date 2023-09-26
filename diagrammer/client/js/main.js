import parser from "./parser.js";
import loadSampleInto from "./samples.js";
import TopLevelParser from "./toplevel.js";
import DiagramModel from "./model/diagram.js";
import ErrorReporter from "./errors.js";
import Portfolio from "./portfolio.js";
import { readText, applyToDiv, clickFor, applyToAll } from "./jstda.js";
import RenderInto from "./render.js";
import { selectTab } from "./tabbing.js";

function initialize() {
	loadSampleInto(document.getElementsByClassName("text-input")[0]);
	var updateButton = document.getElementsByClassName("toolbar-update")[0];
	updateButton.addEventListener("click", pipeline);
	pipeline();

	applyToDiv(".input-tab.tab-title", clickFor(ev => selectTab("input-tab")));
	applyToDiv(".error-tab.tab-title", clickFor(ev => selectTab("error-tab")));
}

function pipeline(ev) {
	var errors = new ErrorReporter();
	var model = new DiagramModel(errors);
	readText(".text-input", parser(new TopLevelParser(model, errors), errors));
	if (errors.hasErrors()) {
		applyToDiv(".error-messages", tab => errors.show(tab));
	} else {
		applyToDiv(".error-messages", tab => tab.innerHTML = '');
		var portfolio = new Portfolio(errors);
		model.partitionInto(portfolio);
		applyToDiv(".tabs-row", tr => applyToDiv(".tab-display", td => portfolio.ensureTabs(tr, td)));
		portfolio.each((name, graph, tab) => graph.layout(new RenderInto(tab)));
	}
	if (errors.hasErrors()) {
		applyToDiv(".error-messages", tab => errors.show(tab));
		applyToAll(".error-tab", tab => errors.unhide(tab));
	} else {
		applyToAll(".error-tab", tab => errors.hide(tab));
	}
}

window.addEventListener('load', initialize);
