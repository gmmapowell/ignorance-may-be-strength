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
	constructor(dir, node) {
		this.dir = dir;
		this.node = node;
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