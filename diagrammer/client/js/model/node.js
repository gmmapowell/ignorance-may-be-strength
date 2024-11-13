class Node {
	constructor(name) {
		this.name = name;
		this.props = [];
	}

	add(prop) {
		this.props.push(prop);
	}
}

class NodeLabel {
	constructor(label) {
		this.name = label;
	}
}

class NodeShape {
	constructor(shape) {
		this.shape = shape;
	}
}

export { Node, NodeLabel, NodeShape };