chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));

chrome.debugger.onEvent.addListener(function(source, method, params) {
    if (method == "Debugger.scriptParsed") {
        console.log(params.url);
    }
});

chrome.tabs.query({ url: "http://localhost/*" }).then(tabs => {
    for (var tab of tabs) {
        if (tab.url == "http://localhost:1399/") {
            chrome.debugger.attach({ tabId: tab.id }, "1.3");
        }
    }
});
