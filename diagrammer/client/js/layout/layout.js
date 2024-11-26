import { ShapeEdge } from "../model/shape.js";
import { Shape } from "../shapes/shape.js";
import { BoxShape } from "../shapes/box.js";
import { CircleShape } from "../shapes/circle.js";
import { NodeShape } from "../model/node.js";
import { PushFrontier } from "./frontier.js";
import { Placement } from "./placement.js";

class LayoutAlgorithm {
	constructor(errors, meta) {
		this.errors = errors;
		this.meta = meta;
		this.placement = new Placement(errors);
	}

	layout() {
		// handle the empty diagram
		if (this.meta.isEmpty()) return;

		this.placeNodes();
		this.connectNodes();
	}

	placeNodes() {
		// The frontier model is designed to provide us with the nodes in a convenient order
		var frontier = new PushFrontier(this.errors, this.meta);

		// First place the most connected node
		var name = frontier.first();
		this.placement.place(0, 0, this.meta.nameMap[name], []);

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
				console.log("connected to", first.relativeTo, "with", placedAt);
				placeAt = first.dir.relativeTo(placedAt.x, placedAt.y);
			} else {
				// try and figure out where it's near ...
				name = frontier.next();
				placeAt = this.findNear(frontier, name);
			}

			console.log("placing", name, placeAt.x, placeAt.y);

			// now place it somewhere near there that isn't occupied
			this.placement.place(placeAt.x, placeAt.y, this.meta.nameMap[name], this.meta.links[name]);
		}
	}

	connectNodes() {
		for (var e of this.meta.edges) {
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
				var xs1 = this.figureEnd(fn.x, fn.w, tn.x, tn.w);
				var ys1 = this.figureEnd(fn.y, fn.h, tn.y, tn.h);
				var xs2 = this.figureEnd(tn.x, tn.w, fn.x, fn.w);
				var ys2 = this.figureEnd(tn.y, tn.h, fn.y, fn.h);
				this.placement.connect([ new ShapeEdge(xs1.pos, ys1.pos, xs1.pt, ys1.pt, 0), new ShapeEdge(xs2.pos, ys2.pos, xs2.pt, ys2.pt, 0) ]);
			}
		}
	}


	// Given a shape with position "pos" and size "size" in some dimension, connected
	// to a shape with position "other" and size "osz" in the same dimension,
	// figure out the coordinate on this side to use, in range pos ... pos+size-1 (usually pos)
	// and the point to connect from (<0 = top/left corner, 0,1,2,3,4... = row/column in range 0..size-1, MAX = bottom/right corner)
	figureEnd(pos, size, other, osz) {
		if (other+osz-1 < pos)
			return { pos, pt: -1 };
		else if (other > pos+size-1)
			return { pos: pos+size-1, pt: Number.MAX_SAFE_INTEGER };
		else if (size == 1)
			return { pos: pos, pt: 0};
		else if (other > pos)
			return { pos, pt: other-pos };
		else
			return { pos, pt: 0 };
	}

	// Look at all the nodes connected to this one which have already been placed and figure out their average position
	// We want to be somewhere near there
	findNear(frontier, name) {
		var sx = 0, sy = 0, cnt = 0;
		var conns = this.meta.connectedTo(name);
		console.log("finding nodes near", name, "based on connections", conns);
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

export default LayoutAlgorithm;