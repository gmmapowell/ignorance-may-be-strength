import DiagramModel from "../../js/model/diagram.js";
import { Node } from "../../js/model/node.js";
import { Edge, EdgeEnd } from "../../js/model/edge.js";
import { expect } from "chai";
import Portfolio from "../../js/portfolio.js";
import { NoError } from "./errorsupport.js";

describe('Diagram Partitioning', () => {
	var diag, portfolio;
	beforeEach(() => {
		diag = new DiagramModel(new NoError());
		portfolio = new MockPortfolio(new NoError());
	});

	it('takes no effort to partition an empty diagram', () => {
		diag.partitionInto(portfolio);
	});

	it('a single node makes a single diagram with that node', () => {
		diag.nodes.push(new Node("single"));
		portfolio.expectDiagrams("single");
		diag.partitionInto(portfolio);
	});

	it('two independent nodes make two diagrams in that order', () => {
		diag.nodes.push(new Node("first"));
		diag.nodes.push(new Node("second"));
		portfolio.expectDiagrams("first", "second");
		diag.partitionInto(portfolio);
	});

	it('two connected nodes form one diagram with the lower name', () => {
		var first = new Node("first");
		var second = new Node("second")
		diag.add(first);
		diag.add(second);
		diag.add(new Edge().add(new EdgeEnd("from", "first")).add(new EdgeEnd("to", "second")));
		diag.validate();
		portfolio.expectDiagrams("first");
		diag.partitionInto(portfolio);
		portfolio.check();
		portfolio.assertDiagram("first", d => expect(d.nodes.length).to.equal(2));
	});

	it('three nodes with two connected form two diagrams', () => {
		var first = new Node("first");
		var second = new Node("second")
		var third = new Node("third")
		diag.add(first);
		diag.add(second);
		diag.add(third);
		diag.add(new Edge().add(new EdgeEnd("from", "first")).add(new EdgeEnd("to", "second")));
		diag.validate();
		portfolio.expectDiagrams("first", "third");
		diag.partitionInto(portfolio);
		portfolio.check();
		portfolio.assertDiagram("first", d => {
			expect(d.nodes.length).to.equal(2);
			expect(d.nodes[0].name).to.equal("first");
			expect(d.nodes[1].name).to.equal("second");
			expect(d.edges.length).to.equal(1);
		});
		portfolio.assertDiagram("third", d => {
			expect(d.nodes.length).to.equal(1)
			expect(d.nodes[0].name).to.equal("third");
			expect(d.edges.length).to.equal(0);
		});
	});

	it('a third node is recursively included by a second (backwards) edge', () => {
		var first = new Node("first");
		var second = new Node("second")
		var third = new Node("third")
		diag.add(first);
		diag.add(second);
		diag.add(third);
		diag.add(new Edge().add(new EdgeEnd("from", "first")).add(new EdgeEnd("to", "second")));
		diag.add(new Edge().add(new EdgeEnd("from", "third")).add(new EdgeEnd("to", "second")));
		diag.validate();
		portfolio.expectDiagrams("first");
		diag.partitionInto(portfolio);
		portfolio.check();
		portfolio.assertDiagram("first", d => {
			expect(d.nodes.length).to.equal(3);
			expect(d.edges.length).to.equal(2);
		});
	});
});

class MockPortfolio {
	constructor(errs) {
		this.proxy = new Portfolio(errs);
	}

	expectDiagrams(...names) {
		this.names = names;
	}

	createDiagram(name) {
		expect(this.names.length, "unexpected diagram created: " + name).to.be.greaterThan(0);
		expect(name).to.equal(this.names.shift());
		return this.proxy.createDiagram(name);
	}

	assertDiagram(name, fn) {
		var seen = false;
		this.proxy.each((n, g, t) => { 
			if (n == name) { fn(g); seen = true; }
		 });
		expect(seen, "there was no diagram created called " + name).to.be.true;
	}

	check() {
		expect(this.names.length, "diagrams not created: " + this.names).to.equal(0);
	}
}