class Blocker {
	constructor(top, errors) {
		this.top = top;
		this.errors = errors;
		this.stack = [];
	}

	line(tok) {
		var current = this.top; // the default

		// find which parser to use, closing and shifting others more deeply indented
		while (this.stack.length > 0) {
			var first = this.stack[0];
			if (tok.indent > first.indent) {
				current = first.handler;
				break;
			}
			if (first.handler && first.handler.complete) {
				first.handler.complete();
			}
			this.stack.shift();
		}

		// call the current parser
		if (!current) {
			// if there is no handler specified at this level, it's because no further nesting is allowed
			this.errors.raise("no content allowed here");
		} else {
			var nested = current.line(tok);
		
			// record this parser for everything under this nesting level
			this.stack.unshift({indent: tok.indent, handler: nested});
		}
	}

	complete() { // on end of input
		while (this.stack.length > 0) {
			var mh = this.stack.shift();
			if (mh.handler && mh.handler.complete)
				mh.handler.complete();
		}
		if (this.top.complete)
			this.top.complete();
	}
}

export default Blocker;