var scripts = document.head.querySelectorAll("script");
for (var s of scripts) {
	if (s.src.endsWith("/till-runtime.js")) {
		chrome.runtime.sendMessage({ action: "haveTill" });
	}
}
