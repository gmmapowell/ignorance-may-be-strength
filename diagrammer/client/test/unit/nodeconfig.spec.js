import NodeConfigParser from "../../js/nodeconfig.js";
import { Node, NodeLabel} from "../../js/model/node.js";
import { Line } from "../../js/tokenize.js";
import { NoError, ExpectedErrors } from "./errorsupport.js";
import MockModel from "./mockmodel.js";
import { expect } from "chai";

describe('NodeConfigParser', () => {
	var model;
	beforeEach(() => {
		model = new MockModel();
	});

	it('rejects a property that begins idiot', () => {
		var errs = new ExpectedErrors("no property: idiot");
		new NodeConfigParser(null, errs).line(new Line(0, ["idiot"]));
		errs.check();
	});

	it('the label property needs a name', () => {
		var errs = new ExpectedErrors("label property requires a name");
		new NodeConfigParser(null, errs).line(new Line(0, ["label"]));
		errs.check();
	});
	
	it('the label property cannot have two arguments', () => {
		var errs = new ExpectedErrors("label: too many arguments");
		new NodeConfigParser(null, errs).line(new Line(0, ["label", "hello", "world"]));
		errs.check();
	});
	
	it('the label property builds an object and returns undefined', () => {
		model.expect(NodeLabel, n => { expect(n.name).to.equal("hello"); });
		var errs = new NoError();
		var nested = new NodeConfigParser(model, errs).line(new Line(0, ["label", "hello"]));
		expect(nested).to.be.undefined;
		model.check(1);
	});
});
