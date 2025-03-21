var tbody = document.getElementById("source-code");
var sourceLines = {};
var breakLines = {};
var breakAt = null;

fetch("http://localhost:1399/src/cafe.till").then(resp => {
	resp.text().then(src => {
		tbody.innerHTML = '';
		var lines = src.split(/\r?\n/g);
		for (var i=0;i<lines.length;i++) {
			var tr = document.createElement("tr");

			var tlineNo = document.createElement("td");
			tlineNo.className = 'line-no'
			tlineNo.appendChild(document.createTextNode(i+1))
			tr.appendChild(tlineNo);

			var tlineText = document.createElement("td");
			tlineText.appendChild(document.createTextNode(lines[i]))
			tr.appendChild(tlineText);

			sourceLines[i+1] = tr;

			tbody.appendChild(tr);
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

tbody.addEventListener('click', ev => {
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
		if (breakAt) {
			breakAt.classList.remove("current-break");
		}
		breakAt = sourceLines[l].children[1];
		breakAt.classList.add("current-break");
        break;
    }
    default: {
        console.log("message:", request);
        break;
    }
    }
});
