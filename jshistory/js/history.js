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

function launchCart() {
	cartStep("details");
	var s = window.history.state;
	s.launchCart = true;
	window.history.replaceState(s, null);
}

function cartStep(path) {
	if (path != "confirm") {
		url(path);
		cartEnabled(true);
	} else {
		replaceConfirm();
		cartEnabled(false);
	}
}

function cartEnabled(enable) {
	var cartButtons = document.querySelectorAll(".cart.buttons button");
	for (var b of cartButtons) {
		if (enable) {
			b.removeAttribute("disabled");
		} else {
			b.setAttribute("disabled", "");
		}
	}
	var launchBtn = document.querySelector(".buttons .launch-cart");
	if (enable) {
		launchBtn.setAttribute("disabled", "");
	} else {
		launchBtn.removeAttribute("disabled");
	}
}

function replaceConfirm() {
	var url = new URL(window.location.href);
	url.pathname = version + '/confirm';
	while (true) {
		var top = window.history.state.launchCart;
		var prev = window.history.state.unique;
		window.history.replaceState({ unique: pushid }, null, url);
		write("cart confirmed at " + prev + " replaced with " + pushid + " for confirmation: " + url + "; stack = " + window.history.length);
		pushid++;
		window.history.back();
		if (top) {
			break;
		}
	}
}

// export the functions that are used externally
window.url = url;
window.launchCart = launchCart;
window.cartStep = cartStep;

// start everything up
var logArea = document.querySelector(".logging");
var pushid = 1;
var version = figureVersion(window.location.pathname);

write("application loaded: " + version);
handleLoad(window.location.origin, window.location.pathname.substring(version.length));
captureLocalAHref(window.location.origin);
capturePopstate();
