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

export { Node, NodeLabel };