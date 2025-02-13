var logArea = document.querySelector(".logging");
var pushid = 1;
var version = figureVersion(window.location.pathname);

function figureVersion(path) {
	var idx = path.indexOf('/', 1);
	if (idx == -1) {
		return path;
	} else {
		return path.substring(0, idx);
	}
}

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
	var url = window.location;
	url.pathname = version + '/' + goto;
	write("pushing " + pushid + " to " + goto + ": url = " + url);
}

// export the functions that are used externally
window.url = url;

write("application loaded: " + version);
