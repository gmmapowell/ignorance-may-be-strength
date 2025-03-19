class Clear {
	constructor(json) {
		this.lineNo = json.LineNo;
		this.vars = json.Vars;
	}

	execute(state) {
		for (var v of this.vars) {
			delete state[v];
		}
	}
}

export { Clear };