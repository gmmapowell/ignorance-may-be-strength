var breakpointLines = {};
var stepMode = false;
var breakpointSource;
var tabsWithTill = [];

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

class RowCollector {
    constructor() {
        this.rows = [];
        this.need = 1;
        this.have = 0;
    }

    ready(nrows) {
        this.need += nrows;
        for (var i=0;i<nrows;i++) {
            this.rows[i] = { rowNum: i, rowInfo: [] };
        }
        this.sendWhenComplete();
    }

    rowHas(row, ncols) {
        this.need += ncols * 2;
        var cs = this.rows[row].rowInfo;
        for (var i=0;i<ncols;i++) {
            cs[i] = { colNum: i };
        }
        this.sendWhenComplete();
    }

    attrs(row, col, attrs) {
        this.rows[row].rowInfo[col].styles = attrs;
        this.sendWhenComplete();
    }

    html(row, col, html) {
        this.rows[row].rowInfo[col].outer = html;
        this.sendWhenComplete();
    }

    sendWhenComplete() {
        this.have++;
        console.log("need", this.need, "have", this.have);
        if (this.need == this.have) {
            console.log("sending collected dom", this.rows);
            chrome.runtime.sendMessage({ action: "present-dom", info: this.rows });
        }
    }
}

chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));

chrome.sidePanel
    .setOptions({ enabled: false, path: "html/sidepanel.html" })
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
            // console.log("resume response", resp);
        });
        break;
    }
    case "haveTill": {
        if (!tabsWithTill.includes(sender.tab.id)) {
            tabsWithTill.push(sender.tab.id);
            chrome.debugger.attach({ tabId: sender.tab.id }, "1.3");
            chrome.debugger.sendCommand({ tabId: sender.tab.id }, "Debugger.enable");
            chrome.sidePanel.setOptions({
                tabId: sender.tab.id,
                path: 'html/sidepanel.html',
                enabled: true
            });
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
        // console.log("paused: ", params.reason, params.hitBreakpoints, params.callFrames);
        chrome.debugger.sendCommand(source, "Debugger.evaluateOnCallFrame", { callFrameId: params.callFrames[0].callFrameId, expression: "this.lineNo" }).then(resp => {
            var lineNo = resp.result.value;
            // console.log("line #:", lineNo);
            if (stepMode || breakpointLines[lineNo]) {
                breakpointSource = source;
                chrome.runtime.sendMessage({ action: "hitBreakpoint", line: lineNo });
                chrome.debugger.sendCommand(source, "Debugger.evaluateOnCallFrame", { callFrameId: params.callFrames[0].callFrameId, expression: "state" }).then(state => {
                    copyObject(source, {}, state.result, copy => {
                        chrome.runtime.sendMessage({ action: "showState", state: copy });
                    })
                });
                var ret = new RowCollector();
                chrome.debugger.sendCommand(source, "DOM.getDocument", {}).then(doc => {
                    findRows(ret, doc.root.nodeId)
                });
            } else {
                chrome.debugger.sendCommand(source, "Debugger.resume").then(resp => {
                    // console.log("resume response", resp);
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

function findRows(collector, nodeId) {
    chrome.debugger.sendCommand(breakpointSource, "DOM.querySelectorAll", { nodeId: nodeId, selector: ".row" }).then(rows => {
        collector.ready(rows.nodeIds.length);
        findColumns(collector, rows.nodeIds);
    });
}

function findColumns(collector, rows) {
    var rowNum = 0;
    for (var rowNum=0;rowNum<rows.length;rowNum++) {
        collectRow(collector, rowNum, rows[rowNum]);
    }
}

function collectRow(collector, rowNum, row) {
    chrome.debugger.sendCommand(breakpointSource, "DOM.querySelectorAll", { nodeId: row, selector: ".cell" }).then(cols => {
        collector.rowHas(rowNum, cols.nodeIds.length);
        findCells(collector, rowNum, cols.nodeIds);
    });
}

function findCells(collector, rowNum, cols) {
    var colNum = 0;
    for (var colNum=0;colNum<cols.length;colNum++) {
        collectCell(collector, rowNum, colNum, cols[colNum]);
    }
}

function collectCell(collector, rowNum, colNum, c) {
    chrome.debugger.sendCommand(breakpointSource, "DOM.getAttributes", { nodeId: c }).then(
        attrs => collector.attrs(rowNum, colNum, attrs.attributes[1])
    );
    chrome.debugger.sendCommand(breakpointSource, "DOM.querySelector", { nodeId: c, selector: ".cell-text" }).then(
        res => {
            chrome.debugger.sendCommand(breakpointSource, "DOM.getOuterHTML", { nodeId: res.nodeId }).then(
                html => collector.html(rowNum, colNum, html.outerHTML)
            );
        }
    );
}

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
    if (info.status != 'loading') {
        return;
    }
    if (!info.url) {
        return;
    }
    for (var i=0;i<tabsWithTill.length;i++) {
        if (tabsWithTill[i] == tabId) {
            tabsWithTill.splice(i, 1);
        }
    }
    await chrome.sidePanel.setOptions({
        tabId,
        enabled: false
    });
});