import { NodeHeight, NodeLabel, NodeShape } from "./model/node.js";

class NodeConfigParser {
	constructor(model, errors) {
		this.model = model;
		this.errors = errors;	
	}

	line(l) {
		var cmd = l.tokens[0];
		switch (cmd) {
			case "height": {
				switch (l.tokens.length) {
					case 1: {
						this.errors.raise("height property requires a value");
						break;
					}
					case 2: {
						var ht = new NodeHeight(parseInt(l.tokens[1]));
						this.model.add(ht);
						break;
					}
					default: {
						this.errors.raise("height: too many arguments");
						break;
					}
				}
				break;
			}
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
			case "shape": {
				switch (l.tokens.length) {
					case 1: {
						this.errors.raise("shape property requires a shape");
						break;
					}
					case 2: {
						var shape = new NodeShape(l.tokens[1]);
						this.model.add(shape);
						break;
					}
					default: {
						this.errors.raise("shape: too many arguments");
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