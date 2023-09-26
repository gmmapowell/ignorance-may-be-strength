class Edge {
	constructor() {
		this.ends = [];
	}

	add(end) {
		this.ends.push(end);
		return this;	
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

export { Edge, EdgeEnd, EdgeEndStyle };