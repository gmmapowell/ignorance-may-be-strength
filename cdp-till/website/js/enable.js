class Enable {
	constructor(json) {
		this.lineNo = json.LineNo;
		this.enabled = json.ActionName == 'enable';
		this.tiles = json.Tiles;
	}

	execute(state) {
		for (var t of this.tiles) {
			if (t == "all") { // enable/disable all
				for (var b of Object.keys(state.buttons)) {
					this.set(state.buttons[b]);
				}
			} else {
				var b = state.buttons[t];
				debugger;
				if (b) {
					this.set(b);
				}
			}
		}
	}

	set(b) {
		if (this.enabled) {
			delete b.disabled;
		} else {
			b.disabled = 'disabled';
		}
	}
}

export { Enable };