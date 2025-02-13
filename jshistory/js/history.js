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

function url(goto) {
	write(goto);
}

// export the functions that are used externally
window.url = url;

write("application loaded");
