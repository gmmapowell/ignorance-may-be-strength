import CanvasAbstraction from "./canvasabstraction.js";
import { NodeLabel } from "./model/node.js";

var minCanal = 30;

class RenderInto {
	constructor (tab) {
		this.tab = tab;
		var canvas = tab.querySelector(".diagram");
		this.drawto = new CanvasAbstraction(canvas);
		this.shapes = [];
		this.connectors = [];
		this.maxx = 0;
		this.maxy = 0;
		this.columns = {};
		this.rows = {};
		this.totalWidth = 0;
		this.totalHeight = 0;
	}

	shape(x, y, w, h, s) {
		if (x+w >= this.maxx) this.maxx = x+w+1;
		if (y+h >= this.maxy) this.maxy = y+h+1;

		for (var i=0;i<h;i++) {
			if (!this.rows[y+i]) {
				this.rows[y+i] = new RowInfo();
			}
		}
		for (var i=0;i<w;i++) {
			if (!this.columns[x+i]) {
				this.columns[x+i] = new ColumnInfo();
			}
		}
		this.rows[y].include(s);
		this.columns[x].include(s);

		this.shapes.push({ x, y, w, h, s });
	}

	connector(pts) {
		this.connectors.push(pts);
	}

	done() {
		this.figureGrid();
		this.drawto.resizeTo(this.totalWidth, this.totalHeight);

		// draw all the shapes
		for (var i=0;i<this.shapes.length;i++) {
			var si = this.shapes[i];
			this.drawShape(si.x, si.y, si.w, si.h, si.s);
		}

		// draw the connectors
		for (var i=0;i<this.connectors.length;i++) {
			var pts = this.connectors[i];
			this.drawConnector(pts);
		}

	}

	figureGrid() {
		// based on the rows and columns, we can figure out what the grid should be
		// because it's a grid, which just need two sets of values, one that maps x units to x locations and one for y
		var xpos = minCanal; // the left margin
		for (var i=0;i<this.maxx;i++) {
			if (!this.columns[i]) continue; // this should not be possible, but safety first ...
			var c = this.columns[i];
			c.from = xpos;
			xpos += c.maxwidth;
			c.to = xpos;
			c.channels = [];
			xpos += c.right;
		}
		this.totalWidth = xpos;

		var ypos = minCanal; // the top margin
		for (var i=0;i<this.maxy;i++) {
			if (!this.rows[i]) continue; // this should not be possible, but safety first ...
			var c = this.rows[i];
			c.from = ypos;
			ypos += c.maxheight;
			c.to = ypos;
			c.channels = [];
			ypos += c.below;
		}
		this.totalHeight = ypos;
	}

	drawShape(x, y, w, h, shape) {
		var colF = this.columns[x];
		var rowF = this.rows[y];
		var colT = this.columns[x+w-1];
		var rowT = this.rows[y+h-1];
		var left = colF.from;
		var top = rowF.from;
		var width = colT.to - left;
		var height = rowT.to - top;
		shape.render(this.drawto, left, top, width, height);

		// try and show the label (if any)
		var label = this.findProp(shape, NodeLabel);
		var cx = left + width/2;
		var cy = top + height/2;
		if (label) {
			this.drawto.text(label.name, cx, cy, width * .75, height * .75);
		}
	}

	findProp(shape, clz) {
		if (!shape.info || !shape.info.props) return;
		var ps = shape.info.props;
		for (var i=0;i<ps.length;i++) {
			var p = ps[i];
			if (p instanceof clz)
				return p;
		}
		return null;
	}

	drawConnector(pts) {
		// a connector consists of a series of connected line segments
		var prev = null;
		this.drawto.newpath();
		for (var i=0;i<pts.length;i++) {
			var curr = this.determinePoint(pts[i]);
			if (prev) {
				this.drawto.move(curr.x, curr.y);
			} else {
				this.drawto.line(curr.x, curr.y);
			}
		}
		this.drawto.stroke();
	}

	determinePoint(pt) {
		var c = this.columns[pt.x];
		var r = this.rows[pt.y];
		var x, y;
		switch (pt.xd) {
			case -1: 
				x = c.from;
				break;
			case 0:
				x = (c.from+c.to)/2;
				break;
			case 1:
				x = c.to;
				break;
		}
		switch (pt.yd) {
			case -1: 
				y = r.from;
				break;
			case 0:
				y = (r.from+r.to)/2;
				break;
			case 1:
				y = r.to;
				break;
		}
		return { x, y };
	}
}

class RowInfo {
	constructor() {
		this.maxheight = 0;
		this.below = minCanal; // the height of the "canal" below this row
	}

	include(s) {
		var bb = s.bbox();
		if (bb.height > this.maxheight) this.maxheight = bb.height;
	}
}

class ColumnInfo {
	constructor() {
		this.maxwidth = 0;
		this.right = minCanal;  // width of the "canal" to the right of this column
	}

	include(s) {
		var bb = s.bbox();
		if (bb.width > this.maxwidth) this.maxwidth = bb.width;
	}
}

export default RenderInto;