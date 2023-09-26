class NoError {
	raise(msg) {
		throw Error("unexpected error: " + msg);
	}
}

class ExpectedErrors {
	constructor(...errs) {
		this.errs = errs;
	}

	raise(msg) {
		for (var i=0;i<this.errs.length;i++) {
			if (this.errs[i] == msg) {
				this.errs[i] = undefined;
				return;
			}
		}
		throw Error("unexpected error: " + msg);
	}

	check() {
		for (var i=0;i<this.errs.length;i++) {
			if (this.errs[i])
				throw Error("did not see: " + this.errs[i]);
		}
	}
}

export { NoError, ExpectedErrors };