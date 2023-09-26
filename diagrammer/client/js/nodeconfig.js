import { NodeLabel } from "./model/node.js";

class NodeConfigParser {
	constructor(model, errors) {
		this.model = model;
		this.errors = errors;	
	}

	line(l) {
		var cmd = l.tokens[0];
		switch (cmd) {
			case "label": {
				switch (l.tokens.length) {
					case 1: {
						this.errors.raise("label property requires a name");
						break;
					}
					case 2: {
						var label = new NodeLabel(l.tokens[1]);
						this.model.add(label);
						break;
					}
					default: {
						this.errors.raise("label: too many arguments");
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

export default NodeConfigParser;