import { EdgeEndStyle } from "./model/edge.js";

class EdgeEndPropertiesParser {
	constructor(model, errors) {
		this.model = model;
		this.errors = errors;	
	}

	line(l) {
		var cmd = l.tokens[0];
		switch (cmd) {
			case "cap": {
				switch (l.tokens.length) {
					case 1: {
						this.errors.raise(cmd + " property requires a style");
						break;
					}
					case 2: {
						var end = new EdgeEndStyle(l.tokens[1]);
						this.model.add(end);
						break;
					}
					default: {
						this.errors.raise(cmd + ": too many arguments");
						break;
					}
				}
				break;
			}
			default: {
				this.errors.raise("no property: " + cmd);
			}
		}
	}
}

export default EdgeEndPropertiesParser;