import NodeConfigParser from "./nodeconfig.js";
import EdgeConfigParser from "./edgeconfig.js";
import Node from "./model/node.js";
import Edge from "./model/edge.js";

class TopLevelParser {
	constructor(model, errors) {
		this.model = model;
		this.errors = errors;
	}

	line(l) {
		var cmd = l.tokens[0];
		switch (cmd) {
			case "node": {
				switch(l.tokens.length) {
					case 1: {
						this.errors.raise("node command requires a name");
						break;
					}
					case 2: {
						var node = new Node(l.tokens[1]);
						this.model.add(node);
						return new NodeConfigParser(node);
					}
					default: {
						this.errors.raise("node: too many arguments");
						break;
					}
				}
				break;
			}
			case "edge": {
				switch(l.tokens.length) {
					case 1: {
						var edge = new Edge();
						this.model.add(edge);
						return new EdgeConfigParser(edge);
					}
					default: {
						this.errors.raise("edge: not allowed arguments");
						break;
					}
				}
				break;
			}
			default: {
				this.errors.raise("no command: " + cmd);
			}
		}
	}
}

export default TopLevelParser;