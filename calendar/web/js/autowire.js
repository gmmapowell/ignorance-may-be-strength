var ElementWithId = function(label) {
	this.label = label;
}

var ControllerOfType = function(type) {
	this.type = type;
}

var StateElement = function(category, entry) {
	this.category = category;
	this.entry = entry;

	// should be set up during autowire
	this.sharedstate = null;
}

StateElement.prototype.value = function() {
	return this.sharedstate.map[this.entry];
}

StateElement.prototype.set = function(val) {
	this.sharedstate.map[this.entry] = val;
	this.sharedstate.store();
}

var AutoWire = function(elementProvider, storageProvider) {
	this.elementProvider = elementProvider;
	this.storageProvider = storageProvider;
	this.storageCategories = {};
}

AutoWire.prototype.wireUp = function(...objs) {
	// allow objects to ask for state
	for (var o in objs) {
		this.enableStorage(objs[o]);
	}

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

AutoWire.prototype.enableStorage = function(obj) {
	var props = Object.keys(obj);
	for (var p in props) {
		var k = props[p];
		if (obj[k] instanceof StateElement) {
			var se = obj[k];
			if (!this.storageCategories[se.category]) {
				this.storageCategories[se.category] = new SharedState(this.storageProvider, se.category);
			}
			obj[k].sharedstate = this.storageCategories[se.category];
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

/**
 * This class is used to share state between clients of the same category.
 * This is just used internally by Autowire and StateElement
 */

var SharedState = function(storage, category) {
	this.storage = storage;
	this.category = category;
	this.map = storage.currentState(category);
}

SharedState.prototype.load = function() {
	this.map = this.storage.currentState(this.category);
}

SharedState.prototype.store = function() {
	this.storage.storeState(this.category, this.map);
}

export { ElementWithId, ControllerOfType, StateElement, AutoWire };