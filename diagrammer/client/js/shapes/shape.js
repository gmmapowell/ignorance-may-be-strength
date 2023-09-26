class Shape {
	constructor(renderClass, info) {
		this.renderClass = renderClass;
		this.info = info;
		this.bboxInfo = { width: 100, height: 100 };
	}

	bbox() {
		return this.bboxInfo;
	}

	render(ca, x, y, w, h) {
		this.renderClass.render(ca, x, y, w, h); // draw the actual shape
	}
}

export default Shape;