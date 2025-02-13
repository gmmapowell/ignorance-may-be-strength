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

function handleLoad(origin, route) {
	if (route == "/") {
		write("loaded with root; setting state to " + pushid + "; stack = " + window.history.length);
		window.history.replaceState({unique: pushid++}, null);
	} else {
		var nested = new URL(window.location.href);
		var root = new URL(window.location.href);
		root.pathname = version + "/";
		write("loaded with route " + route + "; replacing with " + root + " as " + pushid + "; stack = " + window.history.length);
		window.history.replaceState({unique: pushid++}, null, root);
		window.history.pushState({unique: pushid}, null, nested);
		write("pushing " + nested + " as " + pushid + "; stack = " + window.history.length);
		pushid++;
	}
}

function url(goto) {
	var url = new URL(window.location.href);
	url.pathname = version + '/' + goto;
	window.history.pushState({unique: pushid}, null, url);
	write("pushing " + pushid + " to " + goto + ": url = " + url + "; stack = " + window.history.length);
	pushid++;
}

function moveTo(url, state) {
	write("moved to " + state.unique + " at " + url + "; stack = " + window.history.length);
}

function captureLocalAHref(origin) {
	document.addEventListener('click', (ev) => {
		var t = ev.target;
		if (t.tagName === 'A' && t.origin === origin) {
			ev.preventDefault();
			url(t.pathname.substring(version.length+1));
		}
	});
}

function capturePopstate() {
	window.addEventListener("popstate", (ev) => {
		ev.preventDefault();
		moveTo(new URL(window.location.href), ev.state);
	});
}

// export the functions that are used externally
window.url = url;

write("application loaded: " + version);
handleLoad(window.location.origin, window.location.pathname.substring(version.length));
captureLocalAHref(window.location.origin);
capturePopstate();
