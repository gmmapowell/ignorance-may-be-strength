window.addEventListener('load', function(ev) {
	var div = document.getElementById("content-goes-here");

	var root = document.getElementById("root");
	var iroot = root.content.cloneNode(true);
	iroot = div.appendChild(iroot.children[0]);

	var row = document.getElementById("row");
	var irow = row.content.cloneNode(true);
	irow = iroot.appendChild(irow.children[0]);

	var cell = document.getElementById("cell");
	var icell = cell.content.cloneNode(true);
	icell = irow.appendChild(icell.children[0]);
	icell.className = "cell blue-cell";

	var tc = icell.querySelector(".cell-text");
	tc.appendChild(document.createTextNode("hello"));
})
