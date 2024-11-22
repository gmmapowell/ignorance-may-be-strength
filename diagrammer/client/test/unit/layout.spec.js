import { expect } from "chai";
import DiagramModel from "../../js/model/diagram.js";
import { ShapeEdge } from "../../js/model/shape.js";
import { NoError } from "./errorsupport.js";
import { Node, NodeHeight, NodeLabel } from "../../js/model/node.js";
import { Edge, EdgeCompass, EdgeEnd } from "../../js/model/edge.js";

describe('Layout', () => {
	var into;
	beforeEach(() => {
		into = new MockRender();
	});

	it('an empty diagram has nothing except done', () => {
		var diag = diagram(0);
		diag.layout(into);
	});

	it('is easy to lay out just one node', () => {
		var diag = diagram(1);
		into.expectShape(0, 0, "node1");
		diag.layout(into);
	});

	it('two connected nodes are laid out horizontally', () => {
		var diag = diagram(2, [1,2]);
		into.expectShape(0, 0, "node1");
		into.expectShape(1, 0, "node2");
		into.expectConnector([ east(0, 0, 0), west(1, 0, 0) ]);
		diag.layout(into);
	});

	it('three nodes with two connections are laid out in a Y', () => {
		var diag = diagram(3, [1,2], [1,3]);
		into.expectShape(0, 0, "node1");
		into.expectShape(1, 0, "node3");
		into.expectShape(0, 1, "node2");
		into.expectConnector([ east(0, 0, 0), west(1, 0, 0) ]);
		into.expectConnector([ south(0, 0, 0), north(0, 1, 0) ]);
		diag.layout(into);
	});

	it('west is the default for the locations of two connected nodes', () => {
		var diag = diagram(2, [1,2,"W"]);
		into.expectShape(0, 0, "node1");
		into.expectShape(1, 0, "node2");
		into.expectConnector([ east(0, 0, 0), west(1, 0, 0) ]);
		diag.layout(into);
	});

	it('east alters the locations of two connected nodes', () => {
		var diag = diagram(2, [1,2,"E"]);
		into.expectShape(0, 0, "node2");
		into.expectShape(1, 0, "node1");
		into.expectConnector([ west(1, 0, 0), east(0, 0, 0) ]);
		diag.layout(into);
	});

	it('south aligns the two connected nodes vertically', () => {
		var diag = diagram(2, [1,2,"S"]);
		into.expectShape(0, 0, "node2");
		into.expectShape(0, 1, "node1");
		into.expectConnector([ north(0, 1, 0), south(0, 0, 0) ]);
		diag.layout(into);
	});

	it('north aligns the two connected nodes the other way', () => {
		var diag = diagram(2, [1,2,"N"]);
		into.expectShape(0, 0, "node1");
		into.expectShape(0, 1, "node2");
		into.expectConnector([ south(0, 0, 0), north(0, 1, 0) ]);
		diag.layout(into);
	});

	it('three nodes laid out when one is double height', () => {
		var diag = diagram(3, [1,2], [1,3]);
		diag.findNode("node1").add(new NodeHeight(2));
		into.expectShape(1, 0, "node1");
		into.expectShape(2, 0, "node3");
		into.expectShape(0, 0, "node2");
		into.expectConnector([ west(1, 0, 0), east(0, 0, 0)  ]);
		into.expectConnector([ east(1, 0, 0), west(2, 0, 0)  ]);
		diag.layout(into);
	});

	it.skip('three nodes laid out when one is double height and both connections are to the west', () => {
		var diag = diagram(3, [1,2,"W"], [1,3,"W"]);
		diag.findNode("node1").add(new NodeHeight(2));
		into.expectShape(0, 0, "node1");
		into.expectShape(1, 0, "node2");
		into.expectShape(1, 1, "node3");
		into.expectConnector([ east(0, 0, 0), west(1, 0, 0)  ]);
		into.expectConnector([ east(0, 0, 0), west(2, 0, 0)  ]);
		diag.layout(into);
	});

	afterEach(() => {
		into.check();
	});
});

function diagram(nodeCount, ...connectors) {
	var diag = new DiagramModel(new NoError());
	for (var i=0;i<nodeCount;i++) {
		var n = new Node("node"+(i+1));
		n.add(new NodeLabel("node"+(i+1)));
		diag.add(n);
	}
	for (var i=0;i<connectors.length;i++) {
		var c = connectors[i];
		var e = new Edge();
		for (var ei of c) {
			if (typeof(ei) == 'number') {
				var end = new EdgeEnd("from", "node" + ei);
				e.add(end);
			} else {
				e.add(new EdgeCompass(ei));
			}
		}
		diag.add(e);
	}
	diag.validate();
	return diag;
}

function north(x, y, chan) {
	return new ShapeEdge(x, y, 0, -1, chan);
}

function east(x, y, chan) {
	return new ShapeEdge(x, y, Number.MAX_SAFE_INTEGER, 0, chan);
}

function south(x, y, chan) {
	return new ShapeEdge(x, y, 0, Number.MAX_SAFE_INTEGER, chan);
}

function west(x, y, chan) {
	return new ShapeEdge(x, y, -1, 0, chan);
}

class MockRender {
	constructor() {
		this.expect = [];
		this.completed = false;
		this.fails = 0;
	}

	expectShape(x, y, name) {
		var expected = new ExpectShape(x, y, name);
		this.expect.push(expected);
		return expected;
	}

	expectConnector(pts) {
		var expected = new ExpectConnector(pts);
		this.expect.push(expected);
		return expected;
	}

	shape(x, y, w, h, s) {
		for (var i=0;i<this.expect.length;i++) {
			var e = this.expect[i];
			if (e.isShapeAt(x, y)) {
				e.match(s);
				this.expect.splice(i, 1);
				return;
			}
		}
		this.fails++;
		throw new Error("did not expect a shape at " + x +"," + y + ":" + s.info);
	}

	connector(pts) {
		for (var i=0;i<this.expect.length;i++) {
			var e = this.expect[i];
			if (e.isConnector(pts)) {
				this.expect.splice(i, 1);
				return;
			}
		}
		this.fails++;
		throw new Error("did not expect a connector between " + pts);
	}

	done() {
		this.completed = true;
	}

	check() {
		if (this.fails > 0)
			return; // we have already exploded in a test
		expect(this.completed).to.be.true;
		expect(this.expect.length).to.equal(0);
	}
}

class ExpectShape {
	constructor(x, y, name) {
		this.x = x;
		this.y = y;
		this.name = name;
	}

	isShapeAt(a, b) {
		return (a == this.x && b == this.y);
	}

	isConnector(pts) {
		return false;
	}

	match(s) {
		expect(s.info.name).to.equal(this.name);
	}
}

class ExpectConnector {
	constructor(pts) {
		this.pts = pts;
	}

	isShapeAt() {
		return false;
	}

	isConnector(pts) {
		if (pts.length != this.pts.length)
			return false;

		for (var i=0;i<pts.length;i++) {
			var p = pts[i];
			var tp = this.pts[i];
			if (p.x != tp.x)
				return false;
			if (p.y != tp.y)
				return false;
			if (p.xd != tp.xd)
				return false;
			if (p.yd != tp.yd)
				return false;
		}

		return true;
	}
}