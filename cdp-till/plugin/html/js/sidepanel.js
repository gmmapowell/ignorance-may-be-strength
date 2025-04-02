var srcbody = document.getElementById("source-code");
var sourceLines = {};
var breakLines = {};
var breakAt = null;
var debugMode = false;

var continueButton = document.querySelector(".tool-continue");
var stepButton = document.querySelector(".tool-step");

fetch("http://localhost:1399/src/cafe.till").then(resp => {
	resp.text().then(src => {
		srcbody.innerHTML = '';
		var lines = src.split(/\r?\n/g);
		for (var i=0;i<lines.length;i++) {
			var tr = document.createElement("tr");

			var tlineNo = document.createElement("td");
			tlineNo.className = 'line-no';
			tlineNo.appendChild(document.createTextNode(i+1));
			tr.appendChild(tlineNo);

			var tlineText = document.createElement("td");
			tlineText.appendChild(document.createTextNode(lines[i]));
			tr.appendChild(tlineText);

			sourceLines[i+1] = tr;

			srcbody.appendChild(tr);
		}
	});
});

fetch("http://localhost:1399/till-code").then(resp => {
	resp.json().then(code => {
		for (var entry of code) {
			if (entry.LineNo) {
				breakLines[entry.LineNo] = entry;
			}
			if (entry.Actions) {
				for (var a of entry.Actions) {
					if (a.LineNo) {
						breakLines[a.LineNo] = a;
					}
				}
			}
		}
	})
});

srcbody.addEventListener('click', ev => {
	var target = ev.target;
	var row = target.parentElement;
	if (row.tagName == 'TR') {
		var lineNoTD = row.querySelector(".line-no"); // this is a td
		var lineText = lineNoTD.innerText;
		var lineNo = Number(lineText);
		if (breakLines[lineNo]) {
			var enabled = lineNoTD.classList.toggle("breakpoint");
			chrome.runtime.sendMessage({ action: "breakpoint", line: lineNo, enabled: enabled }).then(resp => {
				console.log("response", resp);
			});
		}
	}
});

chrome.runtime.onMessage.addListener(function(request, sender, respondTo) {
    switch (request.action) {
    case "hitBreakpoint": {
		var l = request.line;
		breakAt = sourceLines[l].children[1];
		debuggerActive();
        break;
    }
    default: {
        console.log("message:", request);
        break;
    }
    }
});

function selectTab(which) {
	var all = document.querySelectorAll(".tab");
	for (var a of all) {
		a.classList.remove("tab-selected");
	}

	var chosen = document.querySelectorAll(".tab-" + which);
	for (var c of chosen) {
		c.classList.add("tab-selected");
	}
}

function selectTabFn(th, t) {
	th.addEventListener('click', ev => {
		console.log("selected ", t);
		selectTab(t);
	})
}

function selectTabFns(list) {
	for (var t of list) {
		var th = document.querySelector(".tab-head.tab-" + t);
		selectTabFn(th, t);
	}
}

selectTabFns(["source", "stack", "state", "dom"]);
selectTab("source");

function debuggerActive() {
	debugMode = true;
	breakAt.classList.add("current-break");
	continueButton.classList.add("available");
	stepButton.classList.add("available");
}

function debuggerInactive() {
	debugMode = false;
	breakAt.classList.remove("current-break");
	continueButton.classList.remove("available");
	stepButton.classList.remove("available");
}

function continueExecution(ev) {
	if (!debugMode) {
		return;
	}
	debuggerInactive();
	askContinue(false);
}

function stepExecution(ev) {
	if (!debugMode) {
		return;
	}
	debuggerInactive();
	askContinue(true);
}

function askContinue(stepMode) {
	chrome.runtime.sendMessage({ action: "continue", stepMode: stepMode }).then(resp => {
		console.log("response", resp);
	});
}

continueButton.addEventListener("click", continueExecution);
stepButton.addEventListener("click", stepExecution);
