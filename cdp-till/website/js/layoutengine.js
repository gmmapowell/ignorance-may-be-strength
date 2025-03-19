class LayoutEngine {
	constructor(document) {
		this.writeTo = document.getElementById("content-goes-here");
		this.root = document.getElementById("root");
		this.row = document.getElementById("row");
		this.cell = document.getElementById("cell");
	}

	layout(layout, state) {
		debugger;
	}
}

export { LayoutEngine }