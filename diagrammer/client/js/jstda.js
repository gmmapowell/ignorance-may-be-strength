function readText(label, processor) {
	var input = document.getElementsByClassName(label)[0];
	processor(input.value);
}

function applyToDiv(label, processor) {
	var tabrow = document.getElementsByClassName(label)[0];
	processor(tabrow);
}

function ensureTabs(portfolio) {
	return function(tabrow) {
		portfolio.ensureTabs(tabrow);
	}
}

export { readText, applyToDiv, ensureTabs };