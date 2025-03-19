class Submit {
	constructor(json) {
		this.lineNo = json.LineNo;
		this.var = json.Var;
	}

	execute(state) {
		console.log(state[this.var]);
	}
}

export { Submit };