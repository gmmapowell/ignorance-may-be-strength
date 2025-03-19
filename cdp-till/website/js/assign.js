class Assign {
	constructor(json) {
		this.lineNo = json.LineNo;
		this.dest = json.Dest;
		this.append = json.Append;
	}

	execute(state) {
		if (typeof(state[this.dest]) === 'undefined') {
			state[this.dest] = [];
		}
		for (var x of this.append) {
			state[this.dest].push(x);
		}
	}
}

export { Assign };