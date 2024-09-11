/** While the CSS is "just text", that is not the easiest thing to work with
 *  So this layers an abstraction on top of that
 */

function SheetRules(...sheets) {
    if (sheets.length == 1 && Array.isArray(sheets[0])) {
        this.sheets = sheets[0];
    } else {
        this.sheets = sheets;
    }
    this.rules = [];
};

SheetRules.prototype.rule = function(name) {
    var ret = new SheetRule(name);
    this.rules.push(ret);
    return ret;
}

SheetRules.prototype.apply = function() {
    for (var sheet of this.sheets) {
        this.clearOut(sheet);
        for (var i=0;i<this.rules.length;i++) {
            this.rules[i].applyTo(sheet);
        }
    }
}

SheetRules.prototype.clearOut = function(sheet) {
    while (sheet.cssRules.length > 0) {
        sheet.deleteRule(0);
    }
}

SheetRules.prototype.clear = function() {
    while (this.rules.length > 0) {
        for (var i=0;i<this.sheets.length;i++) {
            this.rules[0].removeFrom(this.sheets[i]);
        }
        this.rules.splice(0, 1);
    }
}

// I don't think we need to export this by name
function SheetRule(name) {
    this.name = name;
    this.ruleIdx = -1;
    this.properties = {};
}

SheetRule.prototype.property = function(prop, ...args) {
    if (this.properties[prop]) {
        throw new Error("duplicate property " + prop);
    }
    var tx = "";
    for (var i=0;i<args.length;i++) {
        if (i > 0) 
            tx += ' ';
        tx += args[i]
    }
    this.properties[prop] = tx;
}

SheetRule.prototype.assembleRule = function() {
    var tx = this.name + " {";
    var keys = Object.keys(this.properties);
    for (var i=0;i<keys.length;i++) {
        if (i == 0)
            tx += ' ';
        tx += keys[i] + ": " + this.properties[keys[i]] + "; ";
    }
    tx += "}";
    return tx;
}

SheetRule.prototype.applyTo = function(sheet) {
    var tx = this.assembleRule();
    this.ruleIdx = sheet.insertRule(tx);
}

SheetRule.prototype.removeFrom = function(sheet) {
    if (this.ruleIdx != -1) {
        sheet.deleteRule(this.ruleIdx);
        this.ruleIdx = -1;
    }
}

export { SheetRules, SheetRule };