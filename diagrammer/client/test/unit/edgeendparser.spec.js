import EdgeEndPropertiesParser from "../../js/edgeendparser.js";
import { EdgeEndStyle } from "../../js/model/edge.js";
import { Line } from "../../js/tokenize.js";
import { NoError, ExpectedErrors } from "./errorsupport.js";
import MockModel from "./mockmodel.js";
import { expect } from "chai";

describe('EdgeEndPropertiesParser', () => {
	var model;
	beforeEach(() => {
		model = new MockModel();
	});

	it('rejects a property that begins idiot', () => {
		var errs = new ExpectedErrors("no property: idiot");
		new EdgeEndPropertiesParser(null, errs).line(new Line(0, ["idiot"]));
		errs.check();
	});

	it('the cap property needs a style', () => {
		var errs = new ExpectedErrors("cap property requires a style");
		new EdgeEndPropertiesParser(null, errs).line(new Line(0, ["cap"]));
		errs.check();
	});
	
	it('the cap property cannot have two arguments', () => {
		var errs = new ExpectedErrors("cap: too many arguments");
		new EdgeEndPropertiesParser(null, errs).line(new Line(0, ["cap", "hello", "world"]));
		errs.check();
	});
	
	it('the cap property builds an object and returns undefined', () => {
		model.expect(EdgeEndStyle, n => { expect(n.style).to.equal("arrow"); });
		var errs = new NoError();
		var nested = new EdgeEndPropertiesParser(model, errs).line(new Line(0, ["cap", "arrow"]));
		expect(nested).to.be.undefined;
		model.check(1);
	});
});
