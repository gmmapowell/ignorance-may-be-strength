chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));

chrome.debugger.onEvent.addListener(function(source, method, params) {
    if (method == "Debugger.scriptParsed") {
        if (params.url.endsWith("method.js")) {
            chrome.debugger.sendCommand(source, "Debugger.getScriptSource", { scriptId: params.scriptId }).then(src => {
                var lines = src.scriptSource.split(/\r?\n/g);
                for (var i=0;i<lines.length;i++) {
                    if (lines[i].match(/^\s*execute\(/)) {
                        console.log(i+1, lines[i]);
                        console.log("thus break at", i+2);

                        chrome.debugger.sendCommand(source, "Debugger.setBreakpoint", { location: { scriptId: params.scriptId, lineNumber: i+1, columnNumber: 0 }}).then(brk => {
                            console.log("breakpoint at", brk);
                        });
                    }
                }
            });
        }
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
