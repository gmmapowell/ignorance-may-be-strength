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
			if (this.assertUniqueNode(n.name))
				this.nodes.push(n);
		} else if (n instanceof Edge) {
			// TODO: at some point (later), we should check that no ends are "dangling", i.e. referencing nodes that are not in the diagram
			// We can't do this here, because we might not have seen the node yet.
			this.edges.push(n);
		} else {
			this.errors.raise("diagram cannot handle " + n);
		}
	}

	assertUniqueNode(next)  {
		for (var i=0;i<this.nodes.length;i++) {
			if (this.nodes[i].name == next) {
				this.errors.raise("duplicate node name: " + next);
				return false;
			}
		}
		return true;
	}

	partitionInto(c) {
		// Collect together all the node names in order, and create a map back to the actual nodes
		var unseen = [];
		var map = {};
		for (var i=0;i<this.nodes.length;i++) {
			var n = this.nodes[i];
			unseen.push(n.name);
			map[n.name] = n;
		}
		unseen.sort();

		// for each still-unseen node, create a new diagram with that node and all the edges and nodes connected to it
		while (unseen.length > 0) {
			var first = unseen.shift();
			var diag = c.createDiagram(first);
			// add the first node
			diag.add(map[first]);
			// now recursively drag in any edges and nodes connected to this one ...
			this.dragEdgesAndNodes(diag, first, unseen);
		}
	}

	dragEdgesAndNodes(diag, from, unseen) {
		// see which edges need to be pulled in based on "from"
		var needEdges = [];
		for (var i=0;i<this.edges.length;i++) {
			var e = this.edges[i];
			for (var j=0;j<e.ends.length;j++) {
				var end = e.ends[j];
				if (end.node.name == from) {
					needEdges.push(e);
					if (!diag.edges.includes(e))
						diag.add(e);
					break;
				}
			}
		}

		// now for each of these edges, pull in the nodes to which they are connected
		var newNodes = [];
		for (var i=0;i<needEdges.length;i++) {
			var e = needEdges[i];
			for (var j=0;j<e.ends.length;j++) {
				var end = e.ends[j];
				var k = unseen.indexOf(end.node.name);
				if (k != -1) {
					// we want to pull this one in recursively
					diag.add(end.node);
					newNodes.push(end.node.name);
					unseen.splice(k, 1);
				}
			}
		}

		// and now recursively handle each newly introduced node
		for (var i=0;i<newNodes.length;i++) {
			var n = newNodes[i];
			this.dragEdgesAndNodes(diag, n, unseen);
		}
	}
}

export default DiagramModel;