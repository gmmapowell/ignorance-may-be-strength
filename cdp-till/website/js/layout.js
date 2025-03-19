class LayoutRow {
	constructor(json) {
		this.lineNo = json.LineNo;
		this.tiles = json.Tiles;
	}
}

class Layout {
	constructor(json) {
		this.lineNo = json.LineNo;
		this.rows = [];
		for (var r of json.Rows) {
			this.rows.push(new LayoutRow(r));
		}
	}
}

export { Layout }