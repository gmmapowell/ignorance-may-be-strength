var styledDiv;
var sheet;

function initStyling(fbdiv) {
	styledDiv = fbdiv;
	sheet = new CSSStyleSheet();
	document.adoptedStyleSheets = [sheet];
}

function fitToPageSize() {
	while (sheet.cssRules.length > 0)
		sheet.deleteRule(0);
	sheet.insertRule(".body-day { width: 25mm; height: 25mm; margin: 2mm }");
	sheet.insertRule(".body-day-date { top: 3mm; left: 3mm; font-size: 5mm }");
}