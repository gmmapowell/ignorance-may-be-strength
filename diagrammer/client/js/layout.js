import { ShapeEdge } from "./model/shape.js";
import Shape from "./shapes/shape.js";
import BoxShape from "./shapes/box.js";

class LayoutAlgorithm {
	constructor(errors, nodes, nameMap, edges) {
		this.errors = errors;
		this.nodes = nodes;
		this.nameMap = nameMap;
		this.edges = edges;
		this.placement = new Placement();
	}

	layout() {
		// handle the empty diagram
		if (this.nodes.length == 0) return;

		this.placeNodes();
		this.connectNodes();
	}

	placeNodes() {
		// The frontier model is designed to provide us with the nodes in a "most connected" order
		var frontier = new PushFrontier(this.nodes, this.edges);

		// First place the most connected node
		var name = frontier.first();
		this.placement.place(0, 0, this.nameMap[name]);

		// Now, iteratively consider all the remaining nodes
		// Each node we receive will be connected to one or more (preferably more) nodes already in the diagram
		while (frontier.push(name)) {
			name = frontier.next();

			// try and figure out where it's near ...
			var avgpos = this.findNear(frontier, name);

			// noew place it somewhere near there that isn't occupied
			this.placement.place(avgpos.x, avgpos.y, this.nameMap[name]);
		}
	}

	connectNodes() {
		for (var i=0;i<this.edges.length;i++) {
			var e = this.edges[i];
			if (e.ends.length != 2) {
				this.errors.raise("cannot handle this case yet");
				continue;
			}
			var f = e.ends[0];
			var t = e.ends[1];
			var fn = this.placement.isPlaced(f.name);
			var tn = this.placement.isPlaced(t.name);
			// This is nothing like sophisticated enough for 90% of cases.  But it passes all current unit tests
			this.placement.connect([ new ShapeEdge(fn.x, fn.y, tn.x-fn.x, tn.y - fn.y, 0), new ShapeEdge(tn.x, tn.y, fn.x - tn.x, fn.y - tn.y, 0) ]);
		}
	}

	// Look at all the nodes connected to this one which have already been placed and figure out their average position
	// We want to be somewhere near there
	findNear(frontier, name) {
		var sx = 0, sy = 0, cnt = 0;
		var conns = frontier.connectedTo(name);
		for (var i=0;i<conns.length;i++) {
			var c = conns[i];
			var pl = this.placement.isPlaced(c);
			if (pl) {
				sx += pl.x;
				sy += pl.y;
				cnt++;
			}
		}
		return { x: sx/cnt, y: sy/cnt };
	}

	// Once we've done all the hard work, rendering them should be easy ...
	render(renderInto) {
		this.placement.eachNode( item => {
			renderInto.shape(item.x, item.y, new Shape(new BoxShape(), item.node));
		});

		this.placement.eachConnector( pts => {
			renderInto.connector(pts);
		});

		renderInto.done();
	}
}

/* The PushFrontier model is designed to deliver all of the nodes in a "most connected" way.
 * That is, we want to first place the node with the most connections, then the node with the most connections to nodes in the graph, etc.
 */
class PushFrontier {
	constructor(nodes, edges) {
		this.conns = this.groupByConnections(nodes, edges);
		this.sorted = this.sortConnections(this.conns);
		this.radices = this.gatherRadices(this.sorted);
		this.done = [];
		this.frontier = [];
	}

	// finding the first node is easy - its the first one in the list with the most connections
	first() {
		var r = this.radices[0];
		var node = this.sorted[r][0];
		return node;
	}

	// when we have used a node, we need to be careful not to use it again, but then to bring all the connected nodes into the frontier
	// they are now available for selection
	push(node) {
		this.done.push(node);
		var add = this.conns[node];
		for (var i=0;i<add.length;i++) {
			if (!this.done.includes(add[i]))
			this.frontier.push(add[i]);
		}
		return this.frontier.length > 0;
	}

	// for all subsequent nodes, we want to select the node with the most connections in the graph, or the most connections, or the earliest alphabetical name
	next() {
		var mostInGraph = -1;
		var mostTotal = -1;
		var ret = null;
		var pos = -1;
		for (var i=0;i<this.frontier.length;i++) {
			var node = this.frontier[i];
			var total = this.conns[node].length;
			var inGraph = this.chooseDone(this.conns[node]);
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
				ret = node;
				pos = i;
			}
		}
		this.frontier.splice(pos, 1);
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

	connectedTo(name) {
		return this.conns[name];
	}

	// build a map of nodes to all the nodes it is connected to
	groupByConnections(nodes, edges) {
		var conns = {};
		for (var i=0;i<nodes.length;i++) {
			var n = nodes[i];
			conns[n.name] = [];
		}
		for (var i=0;i<edges.length;i++) {
			var e = edges[i];
			for (var j=0;j<e.ends.length;j++) {
				var end = e.ends[j];
				for (var k=0;k<e.ends.length;k++) {
					var ke = e.ends[k];
					if (ke.name != end.name && !conns[end.name].includes(ke.name)) {
						conns[end.name].push(ke.name);
					}
				}
			}
		}
		return conns;
	}

	// Sort the nodes by number of connections.  Use a radix sort for speed and fit.
	sortConnections(conns) {
		var sorted = {};
		var keys = Object.keys(conns);
		for (var i=0;i<keys.length;i++) {
			var k = keys[i];
			var cs = conns[k].length;
			if (!sorted[cs]) sorted[cs] = [];
			sorted[cs].push(k);
		}
		return sorted;
	}

	// Build a sorted array of the radices produced
	gatherRadices(sorted) {
		return Object.keys(sorted).sort((a,b) => b-a);
	}
}

class Placement {
	constructor(errors) {
		this.errors = errors;
		this.placed = [];
		this.placement = {};
		this.connectors = [];
	}

	// attempt to place a node in the grid at a given position
	// if that position is occupied, try and find somewhere else for it to go
	// if that position is above or to the left of the grid, move everything down/across to make room for it
	place(x, y, node) {
		var xy = this.findSlot(x, y);
		if (xy.x < 0) xy = this.moveRight(xy); // not yet implemented :-)
		if (xy.y < 0) xy = this.moveDown(xy);
		var p = { x: xy.x, y: xy.y, node };
		this.placed.push(p);
		this.placement[node.name] = p;
	}

	connect(pts) {
		this.connectors.push(pts);
	}

	// find a slot for the node to go in, ideally the one it asked for
	findSlot(x, y) {
		// rounding is good from the perspective of trying something, but we possibly should try "all 4" (if not an integer) before trying neighbouring squares.
		x = Math.round(x);
		y = Math.round(y);

		// if that slot is free, go for it!
		if (!this.haveNodeAt(x, y))	return { x, y };

		// first try the four cardinal points
		if (!this.haveNodeAt(x+1, y))	return { x: x+1, y: y };
		if (!this.haveNodeAt(x, y+1))	return { x: x,   y: y+1 };
		if (!this.haveNodeAt(x-1, y))	return { x: x-1, y: y };
		if (!this.haveNodeAt(x, y-1))	return { x: x,   y: y-1 };

		this.errors.raise("can't handle this case in layout");
	}

	haveNodeAt(x, y) {
		for (var i=0;i<this.placed.length;i++) {
			var p = this.placed[i];
			if (p.x == x && p.y == y)
				return true;
		}
		return false;
	}

	isPlaced(name) {
		return this.placement[name];
	}

	eachNode(f) {
		for (var i=0;i<this.placed.length;i++) {
			f(this.placed[i]);
		}
	}

	eachConnector(f) {
		for (var i=0;i<this.connectors.length;i++) {
			f(this.connectors[i]);
		}
	}
}

export default LayoutAlgorithm;