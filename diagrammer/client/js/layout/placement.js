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
	place(x, y, node, conns) {
		var xy = this.findSlot(x, y, node.size(), conns);
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

	connectedTo(name) {
		return [];
	}

	connect(pts) {
		this.connectors.push(pts);
	}

	// find a slot for the node to go in, ideally the one it asked for
	findSlot(x, y, size, conns) {
		// rounding is good from the perspective of trying something, but we possibly should try "all 4" (if not an integer) before trying neighbouring squares.
		x = Math.round(x - (size.width-1)/2);
		y = Math.round(y - (size.height-1)/2);

		var slots = [];
		for (var xd = -2;xd <= 2; xd++) {
			for (var yd = -2; yd <= 2; yd++) {
				var cost = this.costOf(x+xd, y+yd, xd*xd+yd*yd, size, conns);
				if (cost)
					slots.push(cost);
			}
		}
		slots.sort(this.cheapest);
		/*
		// if that slot is free, go for it!
		if (!this.haveNodeAt(x, y, size))	return { x, y };

		// first try the four cardinal points
		if (!this.haveNodeAt(x+1, y, size))	return { x: x+1, y: y };
		if (!this.haveNodeAt(x, y+1, size))	return { x: x,   y: y+1 };
		if (!this.haveNodeAt(x-1, y, size))	return { x: x-1, y: y };
		if (!this.haveNodeAt(x, y-1, size))	return { x: x,   y: y-1 };
		*/

		if (slots.length > 0)
			return slots[0];
		else
			this.errors.raise("cannot find free slot to place " + node.name);
	}

	costOf(x, y, size, mean, conns) {
		if (this.haveNodeAt(x, y, size))
			return null;
		var cost = new CostSlot(x, y, size, mean);
		for (var c of conns) {
			var other = this.placement[c];
			if (other == null)
				continue;
			cost.costTo(other);
		}
		return cost;
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

class CostSlot {
	constructor(x, y, size, start) {

	}

	costTo(other) {

	}
}

export { Placement, PlacedAt };