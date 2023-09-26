import { tokenize } from "./tokenize.js";
import Blocker from "./blocker.js";

function parser(top, errors) {
	return function(text) {
		var lines = text.split(/\n/);
		var blocker = new Blocker(top, errors);
		for (var i=0;i<lines.length;i++) {
			tokenize(lines[i], blocker, errors);
		}
	}
}

export default parser;