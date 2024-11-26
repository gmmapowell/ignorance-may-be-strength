/* The PushFrontier model is designed to deliver all of the nodes in a "most connected" way.
 * That is, we want to first place the node with the most connections, then the node with the most connections to nodes in the graph, etc.
 */
class PushFrontier {
	constructor(errors, meta) {
		this.errors = errors;
		this.meta = meta;
		this.done = [];
		this.frontier = [];
		this.currentDirect = [];
	}

	// finding the first node is easy - its the first one in the list with the most connections
	first() {
		var r = this.meta.radices[0];
		var node = this.meta.sorted[r][0];
		return node;
	}

	// when we have used a node, we need to be careful not to use it again, but then to bring all the connected nodes into the frontier
	// they are now available for selection
	push(node) {
		if (this.done.includes(node))
			throw new Error("already done " + node);
		this.done.push(node);
		var add = this.meta.conns[node];
		for (var i=0;i<add.length;i++) {
			if (!this.done.includes(add[i].name))
				this.frontier.push(add[i]);
		}
		
		var direct = this.explicitlyConnected(node);
		for (var d of direct) {
			if (!this.done.includes(d.name))
				this.currentDirect.push(d);
		}

		for (var i=0;i<this.currentDirect.length;i++) {
			if (this.currentDirect[i].name == node) {
				this.currentDirect.splice(i, 1);
				i--;
			}
		}

		for (var i=0;i<this.frontier.length;i++) {
			if (this.frontier[i].name == node) {
				this.frontier.splice(i, 1);
				i--;
			}
		}
		return this.currentDirect.length > 0 || this.frontier.length > 0;
	}

	nextDirect() {
		if (this.currentDirect.length > 0) {
			console.log("next direct is", this.currentDirect[0]);
			return this.currentDirect.shift();
		} else {
			return;
		}
	}

	// in order to make layout-by-direction easier, let's first look at the nodes that have an explicit connection
	// to the node that was just added
	explicitlyConnected(justAdded) {
		var ret = [];
		for (var n of this.meta.conns[justAdded]) {
			if (n.dir && !this.done.includes(n.name)) {
				ret.push({ name: n.name, dir: n.dir, relativeTo: justAdded });
				for (var ik=0;ik<this.frontier.length;ik++) {
					if (this.frontier[ik].name == n.name) {
						this.frontier.splice(ik, 1);
						ik--;
					}
				}
			}
		}
		return ret;
	}

	// for all subsequent nodes, we want to select the node with the most connections in the graph, or the most connections, or the earliest alphabetical name
	next() {
		var mostInGraph = -1;
		var mostTotal = -1;
		var ret = null;
		var pos = -1;
		var i=0;
		for (var node of this.frontier) {
			if (this.done.includes(node.name)) {
				continue;
			}
			var total = this.meta.conns[node.name].length;
			var inGraph = this.chooseDone(this.meta.conns[node.name]);
			var chooseMe = false;
			if (inGraph > mostInGraph) { // it is connected to the most already in the graph
				chooseMe = true;
			} else if (inGraph == mostInGraph && total > mostTotal) { // it is connected to the most other total nodes
				chooseMe = true;
			} else if (inGraph == mostInGraph && total == mostTotal && node < ret) { // it is at least as good and has an earlier name
				chooseMe = true;
			}
			if (chooseMe) {
				mostInGraph = inGraph;
				mostTotal = total;
				ret = node.name;
				pos = i;
			}
			i++;
		}
		if (pos != -1) {
			this.frontier.splice(pos, 1);
			// this.traversed.push(ret);
		}
		return ret;
	}

	// calculate the number of nodes already in the graph a node is connected to, given its list of connections
	chooseDone(conns) {
		var ret = 0;
		for (var i=0;i<conns.length;i++) {
			var c = conns[i];
			if (this.done.includes(c)) {
				ret++;
			}
		}
		return ret;
	}
}

export { PushFrontier };