class CanvasAbstraction {
	constructor(canvas) {
		this.canvas = canvas;
		this.cxt = canvas.getContext('2d');
	}

	newpath() {
		this.cxt.beginPath();
	}

	move(x, y) {
		this.cxt.moveTo(x, y);
	}

	line(x, y) {
		this.cxt.lineTo(x, y);
	}

	ellipse(x, y, w, h) {
		this.cxt.arc(x+w/2, y+h/2, (w+h)/2/2, 0, 2*Math.PI);
	}

	close() {
		this.cxt.closePath();
	}

	stroke() {
		this.cxt.stroke();
	}

	text(s, cx, cy, maxw, maxh) {
		var fs = 10;
		this.cxt.font = fs + "px Arial";
		var bbox = this.cxt.measureText(s);
		var ah = bbox.actualBoundingBoxAscent + bbox.actualBoundingBoxDescent;
		var aw = bbox.actualBoundingBoxRight - bbox.actualBoundingBoxLeft;
		var hr = maxh/ah;
		var wr = maxw/aw;
		var scale = Math.min(hr, wr);
		this.cxt.font = (scale*fs) + "px Arial";
		ah *= scale;
		aw *= scale;
		this.cxt.fillText(s, cx-aw/2, cy+ah/2);
	}

	resizeTo(w, h) {
		this.canvas.width = w;
		this.canvas.height = h;
	}
}

export default CanvasAbstraction;