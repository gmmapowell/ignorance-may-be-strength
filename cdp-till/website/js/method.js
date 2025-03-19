import { Assign } from "./assign.js";
import { Clear } from "./clear.js";
import { Enable } from "./enable.js";
import { Submit } from "./submit.js";

class Method {
	constructor(json) {
		this.lineNo = json.LineNo;
		this.actions = [];
		this.styles = [];
		for (var a of json.Actions) {
			switch (a.ActionName) {
				case "assign": {
					this.actions.push(new Assign(a));
					break;
				}
				case "enable":
				case "disable": {
					this.actions.push(new Enable(a));
					break;
				}
				case "clear": {
					this.actions.push(new Clear(a));
					break;
				}
				case "style": {
					for (var s of a.Styles) {
						this.styles.push(s);
					}
					break;
				}
				case "submit": {
					this.actions.push(new Submit(a));
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