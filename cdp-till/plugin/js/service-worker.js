var breakpointLines = {};

chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));

chrome.runtime.onMessage.addListener(function(request, sender, respondTo) {
    switch (request.action) {
    case "breakpoint": {
        if (request.enabled) {
            breakpointLines[request.line] = {};
        } else {
            delete breakpointLines[request.line];
        }
        break;
    }
    default: {
        console.log("message:", request);
        break;
    }
    }
});

chrome.debugger.onEvent.addListener(function(source, method, params) {
    if (method == "Debugger.scriptParsed") {
        if (params.url.endsWith("method.js")) {
            chrome.debugger.sendCommand(source, "Debugger.getScriptSource", { scriptId: params.scriptId }).then(src => {
                var lines = src.scriptSource.split(/\r?\n/g);
                for (var i=0;i<lines.length;i++) {
                    if (lines[i].match(/^\s*execute\(/)) {
                        chrome.debugger.sendCommand(source, "Debugger.setBreakpoint", { location: { scriptId: params.scriptId, lineNumber: i+1, columnNumber: 0 }}).then(brk => {
                            console.log("breakpoint set in Method.execute at", brk);
                        });
                    }
                }
            });
        }
    } else if (method == "Debugger.paused") {
        console.log("paused: ", params.reason, params.hitBreakpoints, params.callFrames);
        chrome.debugger.sendCommand(source, "Debugger.evaluateOnCallFrame", { callFrameId: params.callFrames[0].callFrameId, expression: "this.lineNo" }).then(resp => {
            var lineNo = resp.result.value;
            console.log("line #:", lineNo);
            if (breakpointLines[lineNo]) {
                console.log("actual breakpoint");
            } else {
                chrome.debugger.sendCommand(source, "Debugger.resume").then(resp => {
                    console.log("resume response", resp);
                });
            }
        });
    }
});

chrome.tabs.query({ url: "http://localhost/*" }).then(tabs => {
    for (var tab of tabs) {
        if (tab.url == "http://localhost:1399/") {
            chrome.debugger.attach({ tabId: tab.id }, "1.3");
            chrome.debugger.sendCommand({ tabId: tab.id }, "Debugger.enable");
        }
    }
});
