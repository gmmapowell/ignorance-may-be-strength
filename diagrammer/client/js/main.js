import parser from "./parser.js";
import TopLevelParser from "./toplevel.js";
import DiagramModel from "./model/diagram.js";
import ErrorReporter from "./errors.js";
import Portfolio from "./portfolio.js";
import { readText, applyToDiv, ensureTabs } from "./jstda.js";

function initialize() {
	var updateButton = document.getElementsByClassName("toolbar-update")[0];
	updateButton.addEventListener("click", pipeline);
}

function pipeline(ev) {
	var errors = new ErrorReporter();
	var model = new DiagramModel(errors);
	readText("text-input", parser(new TopLevelParser(model, errors), errors));
	if (errors.hasErrors()) {
		applyToDiv("error-messages", tab => errors.show(tab));
	} else {
		applyToDiv("error-messages", tab => tab.innerHTML = '');
		var portfolio = new Portfolio(errors);
		model.partitionInto(portfolio);
		applyToDiv("tabs-row", ensureTabs(portfolio));
		portfolio.each((graph, tab) => graph.layout(d => d.drawInto(tab)));
	}
}

window.addEventListener('load', initialize);
