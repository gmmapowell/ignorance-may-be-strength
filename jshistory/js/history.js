var logArea = document.querySelector(".logging");

function scrollTo(elt) {
	logArea.scrollTo(0, elt.offsetTop + elt.offsetHeight - logArea.clientHeight);
}

function write(msg) {
	var elt = document.createElement("div");
	elt.className = "message";
	elt.append(document.createTextNode(msg));
	logArea.append(elt);
	scrollTo(elt);
}

write("application loaded");
