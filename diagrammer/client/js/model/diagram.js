import { Node } from "./node.js";
import { Edge } from "./edge.js";

class DiagramModel {
	constructor(errors) {
		this.errors = errors;
		this.nodes = [];
		this.edges = [];
	}

	add(n) {
		if (n instanceof Node) {
			// TODO: should check name is unique
			this.nodes.push(n);
		} else if (n instanceof Edge) {
			this.edges.push(n);
		} else {
			this.errors.raise("diagram cannot handle " + n);
		}
	}

	partitionInto(c) {
		console.log("partition model into", c);
	}
}

export default DiagramModel;