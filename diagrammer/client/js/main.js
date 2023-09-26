import parser from "./parser.js";
import TopLevelParser from "./toplevel.js";
import DiagramModel from "./model/diagram.js";

function initialize() {
	var updateButton = document.getElementsByClassName("toolbar-update")[0];
	updateButton.addEventListener("click", pipeline);
}

function pipeline(ev) {
	var errors = new ErrorReporter(); // TODO: this will need a DOM node somewhere
	var model = new DiagramModel(errors);
	readText("text-input", parser(new TopLevelParser(model, errors), errors));
	var portfolio = new Portfolio();
	model.partitionInto(portfolio);
	tabModel("tabs-row", ensureTabs(portfolio));
	portfolio.each((graph, tab) => graph.layout(d => d.drawInto(tab)));
}

window.addEventListener('load', initialize);

// TODO: everything below here needs to broken out into modules

// jstda.js
function readText(label, processor) {
	var input = document.getElementsByClassName(label)[0];
	processor(input.value);
}

function tabModel(label, processor) {
	var tabrow = document.getElementsByClassName(label)[0];
	processor(tabrow);
}

function ensureTabs(portfolio) {
	return function(tabrow) {
		portfolio.ensureTabs(tabrow);
	}
}

// portfolio.js
class Portfolio {
	ensureTabs(tabrow) {
		console.log("need to ensure tabs");
	}

	each(f) {
		console.log("iterate over graphs and provide tabs");
	}
}

// errors.js
class ErrorReporter {
	raise(s) {
		console.log("error: " + s);
	}
}