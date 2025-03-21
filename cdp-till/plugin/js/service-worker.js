chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));

chrome.debugger.onEvent.addListener(function(source, method, params) {
    if (method == "Debugger.scriptParsed") {
        console.log(params.url);
    }
});
