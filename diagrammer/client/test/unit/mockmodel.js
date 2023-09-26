import { expect } from "chai";

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

export default MockModel;