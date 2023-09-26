import { expect } from "chai";
import DiagramModel from "../../js/model/diagram.js";
import { ShapeEdge } from "../../js/model/shape.js";
import { NoError } from "./errorsupport.js";
import { Node, NodeLabel } from "../../js/model/node.js";
import { Edge, EdgeEnd } from "../../js/model/edge.js";

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
		var diag = diagram(3, [1,2], [1, 3]);
		into.expectShape(0, 0, "node1");
		into.expectShape(1, 0, "node2");
		into.expectShape(0, 1, "node3");
		into.expectConnector([ east(0, 0, 0), west(1, 0, 0) ]);
		into.expectConnector([ south(0, 0, 0), north(0, 1, 0) ]);
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
		for (var j=0;j<c.length;j++) {
			e.add(new EdgeEnd("from", "node" + c[j]));
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
	return new ShapeEdge(x, y, 1, 0, chan);
}

function south(x, y, chan) {
	return new ShapeEdge(x, y, 0, 1, chan);
}

function west(x, y, chan) {
	return new ShapeEdge(x, y, -1, 0, chan);
}

class MockRender {
	constructor() {
		this.expect = [];
		this.completed = false;
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

	shape(x, y, s) {
		for (var i=0;i<this.expect.length;i++) {
			var e = this.expect[i];
			if (e.isShapeAt(x, y)) {
				this.expect.splice(i, 1);
				e.match(s);
			}
		}
	}

	connector(pts) {
		for (var i=0;i<this.expect.length;i++) {
			var e = this.expect[i];
			if (e.isConnector(pts)) {
				this.expect.splice(i, 1);
			}
		}
	}

	done() {
		this.completed = true;
	}

	check() {
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
		return true;
	}
}