import { Method } from "./method.js";
import { Layout } from "./layout.js";

class Repository {
	constructor(json) {
		this.buttons = {};
		this.layouts = {};
		this.methods = {};
		for (var x of json) {
			switch (x.EntryType) {
			case "button": {
				var m = new Method(x);
				this.methods[x.Name] = m;
				this.buttons[x.Name] = { methodCode: m };
				break;
			}
			case "method": {
				this.methods[x.Name] = new Method(x);
				break;
			}
			case "layout": {
				this.layouts[x.Name] = new Layout(x);
				break;
			}
			default: {
				console.log("what is an", x.EntryType);
				break;
			}
			}
		}
	}
}

export { Repository }