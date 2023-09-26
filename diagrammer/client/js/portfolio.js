import DiagramModel from "./model/diagram.js";

class Portfolio {
	constructor(errors) {
		this.errors = errors;
		this.diagrams = [];
	}

	createDiagram(named) {
		var ret = new DiagramModel(this.errors);
		this.diagrams.push({named, diagram: ret });
		return ret;
	}

	ensureTabs(tabrow) {
		console.log("need to ensure tabs");
	}

	each(f) {
		for (var i=0;i<this.diagrams.length;i++) {
			var d = this.diagrams[i];
			f(d, null);
		}
	}
}

export default Portfolio;