import TopLevelParser from "../../js/toplevel.js";
import NodeConfigParser from "../../js/nodeconfig.js";
import EdgeConfigParser from "../../js/edgeconfig.js";
import Node from "../../js/model/node.js";
import Edge from "../../js/model/edge.js";
import { Line } from "../../js/tokenize.js";
import { NoError, ExpectedErrors } from "./errorsupport.js";
import { expect } from "chai";

describe('TopLevelParser', () => {
	var model;
	beforeEach(() => {
		model = new MockModel();
	});

	it('rejects a command that begins idiot', () => {
		var errs = new ExpectedErrors("no command: idiot");
		new TopLevelParser(null, errs).line(new Line(0, ["idiot"]));
		errs.check();
	});

	it('the node command needs a name', () => {
		var errs = new ExpectedErrors("node command requires a name");
		new TopLevelParser(null, errs).line(new Line(0, ["node"]));
		errs.check();
	});

	it('the node command cannot have two arguments', () => {
		var errs = new ExpectedErrors("node: too many arguments");
		new TopLevelParser(null, errs).line(new Line(0, ["node", "hello", "world"]));
		errs.check();
	});

	it('the node command builds an object and returns a nested parser', () => {
		model.expect(Node, n => { expect(n.name).to.equal("hello"); });
		var errs = new NoError();
		var nested = new TopLevelParser(model, errs).line(new Line(0, ["node", "hello"]));
		expect(nested).to.be.not.undefined;
		expect(nested).to.be.instanceOf(NodeConfigParser);
		model.check(1);
	});

	it('the edge command does not have arguments', () => {
		var errs = new ExpectedErrors("edge: not allowed arguments");
		new TopLevelParser(null, errs).line(new Line(0, ["edge", "hello"]));
		errs.check();
	});

	it('the edge command builds an object and returns a nested parser', () => {
		model.expect(Edge);
		var errs = new NoError();
		var nested = new TopLevelParser(model, errs).line(new Line(0, ["edge"]));
		expect(nested).to.be.not.undefined;
		expect(nested).to.be.instanceOf(EdgeConfigParser);
		model.check(1);
	});
});

class MockModel {
	constructor() {
		this.count = 0;
	}

	expect(type, assertion) {
		this.wantType = type;
		this.assertion = assertion;
	}

	add(e) {
		expect(e).to.be.instanceOf(this.wantType);
		if (this.assertion) {
			this.assertion(e);
		}
		this.count++;
	}

	check(cnt) {
		expect(this.count).to.equal(cnt);
	}
}