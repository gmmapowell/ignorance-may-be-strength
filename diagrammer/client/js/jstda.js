function readText(label, processor) {
	var input = document.querySelector(label);
	processor(input.value);
}

function applyToDiv(label, processor) {
	var tabrow = document.querySelector(label);
	processor(tabrow);
}

function applyToAll(label, processor) {
	var nodes = document.querySelectorAll(label);
	for (var i=0;i<nodes.length;i++) {
		processor(nodes[i]);
	}
}

function clickFor(fn) {
	return function(elt) {
		elt.addEventListener('click', fn);
	}
}

export { readText, applyToDiv, applyToAll, clickFor };