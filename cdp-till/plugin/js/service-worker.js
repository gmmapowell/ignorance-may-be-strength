var breakpointLines = {};
var stepMode = false;
var breakpointSource;

class Tracker {
    constructor(done, result) {
        this.done = done;
        this.result = result;
        this.need = 1;
        this.have = 0;
    }

    needOne() {
        this.need++;
    }

    haveOne() {
        this.have++;
        if (this.have == this.need) {
            this.done(this.result);
        }
    }
}

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
    case "continue": {
        stepMode = request.stepMode;
        chrome.debugger.sendCommand(breakpointSource, "Debugger.resume").then(resp => {
            console.log("resume response", resp);
        });
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
        if (
            params.url.endsWith("method.js") ||
            params.url.endsWith("assign.js") ||
            params.url.endsWith("clear.js") ||
            params.url.endsWith("enable.js") ||
            params.url.endsWith("submit.js")
        ) {
            chrome.debugger.sendCommand(source, "Debugger.getScriptSource", { scriptId: params.scriptId }).then(src => {
                var lines = src.scriptSource.split(/\r?\n/g);
                for (var i=0;i<lines.length;i++) {
                    if (lines[i].match(/^\s*execute\(/)) {
                        chrome.debugger.sendCommand(source, "Debugger.setBreakpoint", { location: { scriptId: params.scriptId, lineNumber: i+1, columnNumber: 0 }}).then(brk => {
                            console.log("breakpoint set in ", params.url, "execute() at", brk);
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
            if (stepMode || breakpointLines[lineNo]) {
                breakpointSource = source;
                chrome.runtime.sendMessage({ action: "hitBreakpoint", line: lineNo });
                chrome.debugger.sendCommand(source, "Debugger.evaluateOnCallFrame", { callFrameId: params.callFrames[0].callFrameId, expression: "state" }).then(state => {
                    copyObject(source, {}, state.result, copy => {
                        chrome.runtime.sendMessage({ action: "showState", state: copy });
                    })
                });
            } else {
                chrome.debugger.sendCommand(source, "Debugger.resume").then(resp => {
                    console.log("resume response", resp);
                });
            }
        });
    }
});

function copyObject(source, objsSeen, remoteObj, done) {
    // there is always the possibility of cycles in data structures
    // if we have seen this object before, just say "it's that object"
    // it may or may not have been filled out yet, but for our purposes we are "done"
    if (objsSeen[remoteObj.objectId]) {
        done(objsSeen[remoteObj.objectId]);
        return;
    }

    // Otherwise, create the object now and store it in the map
    // We will be the only person filling it out
    var ret;
    if (remoteObj.subtype == 'array') {
        ret = [];
    } else {
        ret = {};
    }
    objsSeen[remoteObj.objectId] = ret;

    var tracker = new Tracker(done, ret);
    chrome.debugger.sendCommand(source, "Runtime.getProperties", { objectId: remoteObj.objectId }).then(
        props => copyProperties(source, objsSeen, ret, props, tracker)
    );
}

function copyProperties(source, objsSeen, ret, props, tracker) {
    for (var p of props.result) {
        if (p.isOwn) {
            tracker.needOne();
            copyProperty(source, objsSeen, ret, p.name, p.value, tracker);
        }
    }
    tracker.haveOne();
}

function copyProperty(source, objsSeen, building, prop, remote, tracker) {
    if (remote.type == 'string') {
        building[prop] = remote.value;
        tracker.haveOne();
    } else if (remote.type == 'boolean') {
        building[prop] = remote.value;
        tracker.haveOne();
    } else if (remote.type == 'number') {
        if (prop === 'length' && Array.isArray(building)) {
            // nothing to see here ...
        } else {
            building[prop] = remote.value;
        }
        tracker.haveOne();
    } else if (remote.objectId) {
        copyObject(source, objsSeen, remote, have => {
            building[prop] = have;
            tracker.haveOne();
        });
    } else {
        console.log("how do I copy this?", prop, tracker.tracker, remote);
        tracker.haveOne();
    }
}

chrome.tabs.query({ url: "http://localhost/*" }).then(tabs => {
    for (var tab of tabs) {
        if (tab.url == "http://localhost:1399/") {
            chrome.debugger.attach({ tabId: tab.id }, "1.3");
            chrome.debugger.sendCommand({ tabId: tab.id }, "Debugger.enable");
        }
    }
});
