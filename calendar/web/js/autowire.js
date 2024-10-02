var ElementWithId = function(label) {
	this.label = label;
}

var ControllerOfType = function(type) {
	this.type = type;
}

var AutoWire = function(elementProvider) {
	this.elementProvider = elementProvider;
}

AutoWire.prototype.wireUp = function(...objs) {
	// allow objects to refer to others by class (you will get the first one of the class)
	for (var o in objs) {
		this.interconnect(objs, objs[o]);
	}

	// connect elements from document model
	for (var o in objs) {
		this.attachElements(objs[o]);
	}

	// allow initialization to complete
	for (var o in objs) {
		if (objs[o].init && objs[o].init instanceof Function) {
			objs[o].init();
		}
	}
}

AutoWire.prototype.interconnect = function(list, curr) {
	var props = Object.keys(curr);
	for (var p in props) {
		var k = props[p];
		if (curr[k] instanceof ControllerOfType) {
			curr[k] = this.findOfType(list, curr[k].type);		}
	}
}

AutoWire.prototype.findOfType = function(list, type) {
	for (var o in list) {
		if (list[o] instanceof type) {
			return list[o];
		}
	}
}

AutoWire.prototype.attachElements = function(o) {
	var props = Object.keys(o);
	for (var p in props) {
		var k = props[p];
		if (o[k] instanceof ElementWithId) {
			this.connectElement(o, k, o[k]);
		}
	}
}

AutoWire.prototype.connectElement = function(obj, prop, ewi) {
	obj[prop] = document.getElementById(ewi.label);
}

export { ElementWithId, ControllerOfType, AutoWire };