class Node {
	constructor(name) {
		this.name = name;
		this.props = [];
	}

	add(prop) {
		this.props.push(prop);
	}

	size() {
		var width = 1, height = 1;
		for (var p of this.props) {
			if (p instanceof NodeHeight)
				height = p.height;
		}
		return { width, height };
	}

	toString() {
		for (var p of this.props) {
			if (p instanceof NodeLabel) {
				return "Node[" + p.name +"]";
			}
		}
		return "Node[?]";
	}
}

class NodeHeight {
	constructor(ht) {
		this.height = ht;
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

export { Node, NodeHeight, NodeLabel, NodeShape };