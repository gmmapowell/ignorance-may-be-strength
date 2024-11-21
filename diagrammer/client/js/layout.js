import { ShapeEdge } from "./model/shape.js";
import { Shape } from "./shapes/shape.js";
import { BoxShape } from "./shapes/box.js";
import { CircleShape } from "./shapes/circle.js";
import { NodeShape } from "./model/node.js";

class LayoutAlgorithm {
	constructor(errors, nodes, nameMap, edges) {
		this.errors = errors;
		this.nodes = nodes;
		this.nameMap = nameMap;
		this.edges = edges;
		this.placement = new Placement(errors);
	}

	layout() {
		// handle the empty diagram
		if (this.nodes.length == 0) return;

		this.placeNodes();
		this.connectNodes();
	}

	placeNodes() {
		// The frontier model is designed to provide us with the nodes in a "most connected" order
		var frontier = new PushFrontier(this.errors, this.nodes, this.edges);

		// First place the most connected node
		var name = frontier.first();
		this.placement.place(0, 0, this.nameMap[name]);

		// Now, iteratively consider all the remaining nodes
		// Each node we receive will be connected to one or more (preferably more) nodes already in the diagram
		// var currDirect = [];
		while (frontier.push(name)) {
			var first;
			var placeAt;
			if (first = frontier.nextDirect()) {
				// figure out the location based on compass point
				// var first = currDirect.shift();
				name = first.name;
				var placedAt = this.placement.isPlaced(first.relativeTo);
				if (!placedAt)
					continue;
				placeAt = first.dir.relativeTo(placedAt.x, placedAt.y);
			} else {
				// try and figure out where it's near ...
				name = frontier.next();
				placeAt = this.findNear(frontier, name);
			}

			// now place it somewhere near there that isn't occupied
			this.placement.place(placeAt.x, placeAt.y, this.nameMap[name]);
		}
	}

	connectNodes() {
		for (var e of this.edges) {
			if (e.ends.length != 2) {
				this.errors.raise("cannot handle this case yet");
				continue;
			}
			var f = e.ends[0];
			var t = e.ends[1];
			var fn = this.placement.isPlaced(f.name);
			var tn = this.placement.isPlaced(t.name);
			// This is nothing like sophisticated enough for 90% of cases.  But it passes all current unit tests
			if (fn && tn) {
				var mfx = fn.x + (fn.w - 1)/2;
				var mfy = fn.y + (fn.h - 1)/2;
				var mtx = tn.x + (tn.w - 1)/2;
				var mty = tn.y + (tn.h - 1)/2;
				this.placement.connect([ new ShapeEdge(mfx, mfy, mtx-mfx, mty - mfy, 0), new ShapeEdge(mtx, mty, mfx - mtx, mfy - mty, 0) ]);
			}
		}
	}

	// Look at all the nodes connected to this one which have already been placed and figure out their average position
	// We want to be somewhere near there
	findNear(frontier, name) {
		var sx = 0, sy = 0, cnt = 0;
		var conns = frontier.connectedTo(name);
		for (var c of conns) {
			var pl = this.placement.isPlaced(c.name);
			if (!pl)
				continue;
			if (pl) {
				sx += pl.x;
				sy += pl.y;
				cnt++;
			}
		}
		if (cnt == 0)
			cnt = 1;
		return { x: sx/cnt, y: sy/cnt };
	}

	// Once we've done all the hard work, rendering them should be easy ...
	render(renderInto) {
		this.placement.eachNode( item => {
			var sr = this.figureShape(item.node.props);
			renderInto.shape(item.x, item.y, item.w, item.h, new Shape(sr, item.node));
		});

		this.placement.eachConnector( pts => {
			renderInto.connector(pts);
		});

		renderInto.done();
	}

	figureShape(props) {
		for (var p of props) {
			if (p instanceof NodeShape) {
				switch (p.shape) {
				case "circle":
						return new CircleShape();
				case "box":
				default:
						return new BoxShape();
				}
			}
		}

		// if there isn't a NodeShape property, it's a box
		return new BoxShape();
	}
}

/* The PushFrontier model is designed to deliver all of the nodes in a "most connected" way.
 * That is, we want to first place the node with the most connections, then the node with the most connections to nodes in the graph, etc.
 */
class PushFrontier {
	constructor(errors, nodes, edges) {
		this.errors = errors;
		this.conns = this.groupByConnections(nodes, edges);
		this.sorted = this.sortConnections(this.conns);
		this.radices = this.gatherRadices(this.sorted);
		this.done = [];
		this.frontier = [];
		this.currentDirect = [];
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
		if (this.done.includes(node))
			throw new Error("already done " + node);
		this.done.push(node);
		var add = this.conns[node];
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
			return this.currentDirect.shift();
		} else {
			return;
		}
	}

	// in order to make layout-by-direction easier, let's first look at the nodes that have an explicit connection
	// to the node that was just added
	explicitlyConnected(justAdded) {
		var ret = [];
		for (var n of this.conns[justAdded]) {
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
			var total = this.conns[node.name].length;
			var inGraph = this.chooseDone(this.conns[node.name]);
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
		for (var e of edges) {
			for (var end of e.ends) {
				var c = conns[end.name];
				for (var ke of e.ends) {
					if (ke.name != end.name && !c.includes(ke.name)) {
						var dir = this.figureDir(e.dir, ke.dir);
						conns[end.name].push({ name: ke.name, dir });
					}
				}
			}
		}
		return conns;
	}

	figureDir(compass, endFacing) {
		if (!compass)
			return null;

		if (endFacing == 'to')
			return compass;
		else
			return compass.invert();
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
		var xy = this.findSlot(x, y, node.size());
		if (!xy) {
			console.log("could not find a slot for " + node.name);
			return; // we could not find a slot
		}
		if (xy.x < 0) xy = this.moveRight(xy, -xy.x);
		if (xy.y < 0) xy = this.moveDown(xy, -xy.y);
		var p = new PlacedAt(xy.x, xy.y, node.size().width, node.size().height, node);
		this.placed.push(p);
		this.placement[node.name] = p;
	}

	connect(pts) {
		this.connectors.push(pts);
	}

	// find a slot for the node to go in, ideally the one it asked for
	findSlot(x, y, size) {
		// rounding is good from the perspective of trying something, but we possibly should try "all 4" (if not an integer) before trying neighbouring squares.
		x = Math.round(x - (size.width-1)/2);
		y = Math.round(y - (size.height-1)/2);

		// if that slot is free, go for it!
		if (!this.haveNodeAt(x, y, size))	return { x, y };

		// first try the four cardinal points
		if (!this.haveNodeAt(x+1, y, size))	return { x: x+1, y: y };
		if (!this.haveNodeAt(x, y+1, size))	return { x: x,   y: y+1 };
		if (!this.haveNodeAt(x-1, y, size))	return { x: x-1, y: y };
		if (!this.haveNodeAt(x, y-1, size))	return { x: x,   y: y-1 };

		this.errors.raise("cannot find free slot C, E, S, W or N");
	}

	haveNodeAt(x, y, size) {
		for (var i=0;i<this.placed.length;i++) {
			var p = this.placed[i];
			if (p.overlaps(x, y, size))
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

	moveRight(xy, rightCount) {
		for (var p of this.placed) {
			p.x += rightCount;
		}
		return { x: xy.x + rightCount, y: xy.y };
	}

	moveDown(xy, downCount) {
		for (var p of this.placed) {
			p.y += downCount;
		}
		return { x: xy.x, y: xy.y + downCount };
	}
}

class PlacedAt {
	constructor(x, y, w, h, node) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.node = node;
	}

	overlaps(x, y, size) {
		var ovx = false;
		if (this.x <= x && this.x + this.w > x)
			ovx = true;
		if (x <= this.x && x + size.width > this.x)
			ovx = true;

		var ovy = false;
		if (this.y <= y && this.y + this.h > y)
			ovy = true;
		if (y <= this.y && y + size.height > this.y)
			ovy = true;

		return ovx && ovy;
	}
}
export default LayoutAlgorithm;