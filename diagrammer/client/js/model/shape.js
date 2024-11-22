class ShapeEdge {
	constructor(x, y, xd, yd, chan) {
		this.x = x;
		this.y = y;
		this.xd = xd;
		this.yd = yd;
		this.chan = chan;
	}

	toString() {
		return "EdgeOf[" + this.x + "," + this.y + "]";
	}
}

export { ShapeEdge };