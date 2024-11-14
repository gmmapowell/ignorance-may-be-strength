class Edge {
	constructor() {
		this.ends = [];
		this.dir = null;
	}

	add(end) {
		if (end instanceof EdgeCompass) {
			this.dir = end;
		} else if (end instanceof EdgeEnd) {
			this.ends.push(end);
		} else {
			throw new Error("what is " + end + "?");
		}
		return this;	
	}
}

class EdgeCompass {
	constructor(dir) {
		this.dir = dir;
	}

	invert() {
		switch (this.dir) {
			case 'N': return new EdgeCompass('S');
			case 'S': return new EdgeCompass('N');
			case 'E': return new EdgeCompass('W');
			case 'W': return new EdgeCompass('E');

			case 'NW': return new EdgeCompass('SE');
			case 'SE': return new EdgeCompass('NW');
			case 'NE': return new EdgeCompass('SW');
			case 'SW': return new EdgeCompass('NE');

			default:
				this.errors.raise("can't handle this case in layout");
		}
	}

	relativeTo(x, y) {
		switch (this.dir) {
			case 'E': return { x: x+1, y };
			case 'W': return { x: x-1, y };
			case 'N': return { x, y: y-1 };
			case 'S': return { x, y: y+1 };
			case 'NW': return { x: x-1, y: y-1 };
			case 'SE': return { x: x+1, y: y+1 };
			default: throw new Error("not handled: relative to " + this.dir);
		}
	}
}

class EdgeEnd {
	constructor(dir, name) {
		this.dir = dir;
		this.name = name;
	}

	add(prop) {

	}
}

class EdgeEndStyle {
	constructor(style) {
		this.style = style;
	}
}

export { Edge, EdgeCompass, EdgeEnd, EdgeEndStyle };