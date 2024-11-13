import EdgeEndPropertiesParser from "./edgeendparser.js";
import { EdgeEnd, EdgeCompass } from "./model/edge.js";

class EdgeConfigParser {
	constructor(model, errors) {
		this.model = model;
		this.errors = errors;	
	}

	line(l) {
		var cmd = l.tokens[0];
		switch (cmd) {
			case "compass":
			{
				switch (l.tokens.length) {
					case 1: {
						this.errors.raise(cmd + " property requires a node reference");
						break;
					}
					case 2: {
						var tok = l.tokens[1].toUpperCase();
						switch (tok) {
						case 'N': case 'E': case 'S': case 'W':
						case 'NE': case 'SE': case 'SW': case 'NW':
							var dir = new EdgeCompass(l.tokens[1]);
							this.model.add(dir);
							break;
						default:
							this.errors.raise('compass needs a valid compass point, not ' + tok);
							break;
						}
						break;
					}
					default: {
						this.errors.raise(cmd + ": too many arguments");
						break;
					}
				}
				break;
			}
			case "from": 
			case "to":
			{
				switch (l.tokens.length) {
					case 1: {
						this.errors.raise(cmd + " property requires a node reference");
						break;
					}
					case 2: {
						var end = new EdgeEnd(cmd, l.tokens[1]);
						this.model.add(end);
						return new EdgeEndPropertiesParser(end, this.errors);
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

export default EdgeConfigParser;