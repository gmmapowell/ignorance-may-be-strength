import { Assign } from "./assign.js";

class Method {
	constructor(json) {
		this.lineNo = json.LineNo;
		this.actions = [];
		for (var a of json.Actions) {
			switch (a.ActionName) {
				case "assign": {
					this.actions.push(new Assign(a));
					break;
				}
				default: {
					console.log("not handled", a.ActionName);
					break;
				}
			}
		}
	}

	execute(state) {
		for (var a of this.actions) {
			a.execute(state);
		}
	}
}

export { Method };