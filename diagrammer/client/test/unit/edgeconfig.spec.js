import EdgeConfigParser from "../../js/edgeconfig.js";
import EdgeEndPropertiesParser from "../../js/edgeendparser.js";
import { Edge, EdgeEnd } from "../../js/model/edge.js";
import { Line } from "../../js/tokenize.js";
import { NoError, ExpectedErrors } from "./errorsupport.js";
import MockModel from "./mockmodel.js";
import { expect } from "chai";

describe('EdgeConfigParser', () => {
	var model;
	beforeEach(() => {
		model = new MockModel();
	});

	it('rejects a property that begins idiot', () => {
		var errs = new ExpectedErrors("no property: idiot");
		new EdgeConfigParser(null, errs).line(new Line(0, ["idiot"]));
		errs.check();
	});

	it('the from property needs a node', () => {
		var errs = new ExpectedErrors("from property requires a node reference");
		new EdgeConfigParser(null, errs).line(new Line(0, ["from"]));
		errs.check();
	});
	
	it('the from property cannot have two arguments', () => {
		var errs = new ExpectedErrors("from: too many arguments");
		new EdgeConfigParser(null, errs).line(new Line(0, ["from", "hello", "world"]));
		errs.check();
	});
	
	it('the from property builds an object and returns an EdgeEndPropertiesParser', () => {
		model.expect(EdgeEnd, n => { expect(n.dir).to.equal("from"); expect(n.node).to.equal("hello"); });
		var errs = new NoError();
		var nested = new EdgeConfigParser(model, errs).line(new Line(0, ["from", "hello"]));
		expect(nested).to.be.instanceOf(EdgeEndPropertiesParser);
		model.check(1);
	});

	it('the to property needs a node', () => {
		var errs = new ExpectedErrors("to property requires a node reference");
		new EdgeConfigParser(null, errs).line(new Line(0, ["to"]));
		errs.check();
	});
	
	it('the to property cannot have two arguments', () => {
		var errs = new ExpectedErrors("to: too many arguments");
		new EdgeConfigParser(null, errs).line(new Line(0, ["to", "hello", "world"]));
		errs.check();
	});
	
	it('the to property builds an object and returns an EdgeEndPropertiesParser', () => {
		model.expect(EdgeEnd, n => { expect(n.dir).to.equal("to"); expect(n.node).to.equal("hello"); });
		var errs = new NoError();
		var nested = new EdgeConfigParser(model, errs).line(new Line(0, ["to", "hello"]));
		expect(nested).to.be.instanceOf(EdgeEndPropertiesParser);
		model.check(1);
	});
});
