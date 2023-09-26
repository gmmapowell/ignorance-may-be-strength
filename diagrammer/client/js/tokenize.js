class Line {
	constructor(indent, tokens) {
		this.indent = indent;
		this.tokens = tokens;
	}
}

function tokenize(s, sink, errors) {
	if (!s.trim())
		return null;
	if (s.trim().startsWith("//"))
		return null;
	var ind = 0;
	var toks = [];
	for (var i=0;i<s.length;i++) {
		if (s.charAt(i) == ' ') {
			ind++;
		} else if (s.charAt(i) == '\t') {
			ind = Math.floor((ind+4)/4)*4;
		} else {
			s = s.substr(i);
			break;
		}
	}
	var line = s;
	var startQuote = -1;
	var quoteChar = '';
	var startToken = -1;
	for (var i=0;i<s.length;i++) {
		var c = s.charAt(i);
		if (startQuote == -1) { // handle the cases where we are not in a quoted string
			if (/[ \t]/.test(c)) { // an ordinary space after a token
				if (startToken != -1) { // ignore spaces that come after other spaces
					toks.push(s.substring(startToken, i));
					startToken = -1;
				}
			} else if (/['"]/.test(c)) { // a string is starting
				quoteChar = c;
				startQuote = i+1;
			} else if (startToken == -1) { // this is the first character after a break
				startToken = i;
			}
		} else { // we are in a quoted string
			if (c == quoteChar) { // this is the end of it, unless we have another one coming up ...
				if (i+1 < s.length && s.charAt(i+1) == quoteChar) { // there is another one immediately after, join them together by adjusting the string
					s = s.substring(0, i) + s.substring(i+1, s.length);
					continue;
				} else {
					toks.push(s.substring(startQuote, i));
					startQuote = -1;
				}
			}
		}
	}
	if (startQuote != -1) {
		errors.raise("still in quote: " + line);
		return null;
	}
	if (startToken != -1) {
		toks.push(s.substr(startToken, s.length));
	}
	sink.line(new Line(ind, toks));
}

export { Line, tokenize };