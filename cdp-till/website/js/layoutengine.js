class LayoutEngine {
	constructor(document) {
		this.writeTo = document.getElementById("content-goes-here");
		this.root = document.getElementById("root");
		this.row = document.getElementById("row");
		this.cell = document.getElementById("cell");
	}

	layout(layout, state) {
		this.writeTo.innerHTML = '';
		var iroot = this.root.content.cloneNode(true);
		iroot = this.writeTo.appendChild(iroot.children[0]);
	
		for (var r of layout.rows) {
			var irow = this.row.content.cloneNode(true);
			irow = iroot.appendChild(irow.children[0]);
			for (var c of r.tiles) {
				var icell = this.cell.content.cloneNode(true);
				icell = irow.appendChild(icell.children[0]);
				icell.className = "cell blue-cell";
				var b = state.buttons[c];
				if (b) {
					if (b.styles) {
						for (var s of b.styles) {
							icell.classList.add(s);
						}
					}
					if (b.disabled) {
						icell.classList.add("disabled-tile");
					} else {
						this.addClick(layout, state, icell, state.buttons[c]);
					}
				} else {
					icell.classList.add("blue-text");
				}
				var tc = icell.querySelector(".cell-text");
				tc.appendChild(document.createTextNode(c));
			}
		}
	}

	addClick(layout, state, tile, buttonInfo) {
		tile.addEventListener("click", ev => {
			buttonInfo.methodCode.execute(state);
			this.layout(layout, state);
		});
	}
}

export { LayoutEngine }