class Submit {
	constructor(json) {
		this.lineNo = json.LineNo;
		this.var = json.Var;
	}

	execute(state) {
		var json = JSON.stringify(state[this.var]);
		fetch("/order", { method: "POST", body: json }).then(resp => {
			console.log("submitted order ... response =", resp.status, resp.statusText);
		});
	}
}

export { Submit };