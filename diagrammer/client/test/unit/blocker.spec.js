import Blocker from "../../js/blocker.js";
import { Line } from "../../js/tokenize.js";
import { NoError, ExpectedErrors } from "./errorsupport.js";
import { expect } from "chai";

var PROCESSED = Symbol.for("PROCESSED");

describe('Blocker', () => {
	var top, blocker, firstNested, secondNested;
	beforeEach(() => {
		top = new MockLevelParser();
		firstNested = new MockLevelParser();
		secondNested = new MockLevelParser();
		blocker = new Blocker(top, new NoError());
	});

	it('sends the first line to top', () => {
		top.expect(new Line(0, [])).sendTo(blocker);
	});

	it('a second line with indent 0 also goes to top', () => {
		top.expect(new Line(0, [])).sendTo(blocker);
		top.expect(new Line(0, [])).sendTo(blocker);
	});

	it('an indented line goes to the first nested parser', () => {
		top.expect(new Line(0, []), firstNested).sendTo(blocker);
		firstNested.expect(new Line(4, [])).sendTo(blocker);
	});

	it('after an indented line, an unindented line goes to the top parser', () => {
		top.expect(new Line(0, []), firstNested).sendTo(blocker);
		firstNested.expect(new Line(4, [])).sendTo(blocker);
		top.expect(new Line(0, [])).sendTo(blocker);
	});

	it('a second indented line with the same indent goes to the first nested parser', () => {
		top.expect(new Line(0, []), firstNested).sendTo(blocker);
		firstNested.expect(new Line(4, [])).sendTo(blocker);
		firstNested.expect(new Line(4, [])).sendTo(blocker);
	});

	it('a double indented line goes to the second nested parser', () => {
		top.expect(new Line(0, []), firstNested).sendTo(blocker);
		firstNested.expect(new Line(4, []), secondNested).sendTo(blocker);
		secondNested.expect(new Line(8, [])).sendTo(blocker);
	});

	it('returning undefined means no further nesting allowed', () => {
		blocker = new Blocker(top, new ExpectedErrors("no content allowed here"));
		top.expect(new Line(0, []), firstNested).sendTo(blocker);
		firstNested.expect(new Line(4, [])).sendTo(blocker);
		blocker.line(new Line(8, []));
	});

	it('after a double indented line, a single indent goes to the first nested parser', () => {
		top.expect(new Line(0, []), firstNested).sendTo(blocker);
		firstNested.expect(new Line(4, []), secondNested).sendTo(blocker);
		secondNested.expect(new Line(8, [])).sendTo(blocker);
		firstNested.expect(new Line(4, [])).sendTo(blocker);
	});

	it('complete is called on the top level at the end of input', () => {
		top.expect(new Line(0, [])).sendTo(blocker);
		expect(top.completed).to.equal(false);
		blocker.complete();
		expect(top.completed).to.equal(true);
	});

	it('complete is called on a nested level when the indent repeats', () => {
		top.expect(new Line(0, []), firstNested).sendTo(blocker);
		expect(firstNested.completed).to.equal(false);
		firstNested.expect(new Line(4, [])).sendTo(blocker);
		expect(firstNested.completed).to.equal(false);
		firstNested.expect(new Line(4, [])).sendTo(blocker);
		top.expect(new Line(0, [])).sendTo(blocker);
		expect(firstNested.completed).to.equal(true);
	});

	it('complete is called on a nested level if the indent decreases', () => {
		top.expect(new Line(0, []), firstNested).sendTo(blocker);
		firstNested.expect(new Line(4, []), secondNested).sendTo(blocker);
		secondNested.expect(new Line(8, [])).sendTo(blocker);
		expect(secondNested.completed).to.equal(false);
		firstNested.expect(new Line(4, [])).sendTo(blocker);
		expect(secondNested.completed).to.equal(true);
	});
});

class MockLevelParser {
	constructor() {
		this.completed = false;
	}

	line(l) {
		expect(this.expected).to.equal(l);
		this.expected = PROCESSED;
		return this.nested;
	}

	complete() {
		this.completed = true;
	}

	expect(line, nested) {
		this.expected = line;
		this.nested = nested;
		return this;
	}

	sendTo(blocker) {
		blocker.line(this.expected);
		expect(this.expected).to.equal(PROCESSED);
	}
}