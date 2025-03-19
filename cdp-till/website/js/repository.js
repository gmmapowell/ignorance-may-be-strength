import { Method } from "./method.js";
import { Layout } from "./layout.js";

class Repository {
	constructor(json) {
		this.layouts = {};
		this.methods = {};
		for (var x of json) {
			switch (x.EntryType) {
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
		console.log(this.layouts);
		console.log(this.methods);
	}
}

export { Repository }