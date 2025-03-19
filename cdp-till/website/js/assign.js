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
			if (state[x]) {
				var a = state[x];
				if (Array.isArray(a)) {
					for (var c of a) {
						state[this.dest].push(c);
					}
				} else {
					state[this.dest].push(a);
				}
			} else {
				state[this.dest].push(x);
			}
		}
	}
}

export { Assign };