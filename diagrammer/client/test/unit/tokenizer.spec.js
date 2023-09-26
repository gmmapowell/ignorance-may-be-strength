import { tokenize } from "../../js/tokenize.js";
import { expect } from "chai";

describe('Tokenizer', () => {
	it('ignores a blank line', () => {
		tokenize("", new NoLine(), new NoError());
	});

	it('ignores a comment line', () => {
		tokenize("// hello world", new NoLine(), new NoError());
	});

	it('ignores an indented comment line', () => {
		tokenize("    // hello world", new NoLine(), new NoError());
	});

	it('can handle a simple one word line', () => {
		tokenize("world", new MatchTokens(0, "world"), new NoError());
	});

	it('can handle an indented one word line', () => {
		tokenize("  world", new MatchTokens(2, "world"), new NoError());
	});

	it('a tab is four spaces', () => {
		tokenize("\tworld", new MatchTokens(4, "world"), new NoError());
	});

	it('a tab at position four even when preceded by a couple of spaces', () => {
		tokenize("  \tworld", new MatchTokens(4, "world"), new NoError());
	});

	it('a tab at position eight when preceded by a four spaces', () => {
		tokenize("    \tworld", new MatchTokens(8, "world"), new NoError());
	});

	it('can split multiple words', () => {
		tokenize("hello world", new MatchTokens(0, "hello", "world"), new NoError());
	});

	it('can split multiple words separated by multiple whitespace', () => {
		tokenize("hello \t world", new MatchTokens(0, "hello", "world"), new NoError());
	});

	it('can split multiple words separated by multiple whitespace even with trailing whitespace', () => {
		tokenize("hello \t world  ", new MatchTokens(0, "hello", "world"), new NoError());
	});

	it('can keep words together if in quotes', () => {
		tokenize("hello \"cruel world\"", new MatchTokens(0, "hello", "cruel world"), new NoError());
	});

	it('can keep words together if in single quotes', () => {
		tokenize("hello 'cruel world'", new MatchTokens(0, "hello", "cruel world"), new NoError());
	});

	it('a repeated quote is an apostrophe', () => {
		tokenize("hello 'Fred''s world'", new MatchTokens(0, "hello", "Fred's world"), new NoError());
	});

	it('an unbalanced quote is an error', () => {
		var errs = new ExpectedErrors("still in quote: hello 'Fred");
		tokenize("hello 'Fred", new NoLine(), errs);
		errs.check();
	});
});

class NoLine {
	line(l) {
		throw Error("no line should be produced");
	}
}

class MatchTokens {
	constructor(ind, ...toks) {
		this.ind = ind;
		this.toks = toks;
	}

	line(l) {
		expect(l.indent).to.equal(this.ind);
		expect(l.tokens.length).to.equal(this.toks.length);
		for (var i=0;i<l.tokens.length;i++) {
			expect(l.tokens[i]).to.equal(this.toks[i]);
		}
	}
}

class NoError {
	raise(msg) {
		throw Error("unexpected error: " + msg);
	}
}

class ExpectedErrors {
	constructor(...errs) {
		this.errs = errs;
	}

	raise(l) {
		for (var i=0;i<this.errs.length;i++) {
			if (this.errs[i] == l) {
				this.errs[i] = undefined;
				return;
			}
		}
	}

	check() {
		for (var i=0;i<this.errs.length;i++) {
			if (this.errs[i])
				throw Error("did not see: " + this.errs[i]);
		}
	}
}
