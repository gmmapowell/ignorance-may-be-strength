var ElementWithId = function(label, valueField) {
	this.label = label;
	this.valueField = valueField;
}

ElementWithId.prototype.storedAs = function(category, entry, defvalue) {
	if (!this.valueField) {
		throw new Error("must specify valueField in order to store");
	}
	this.storeAs = new StateElement(category, entry, defvalue);
	return this;
}

var ControllerOfType = function(type) {
	this.type = type;
}

var AutoWireStorage = function() {
}

var StateElement = function(category, entry, defvalue) {
	this.category = category;
	this.entry = entry;
	this.defvalue = defvalue;

	// should be set up during autowire
	this.sharedstate = null;
}

StateElement.prototype.value = function() {
	if (this.sharedstate && this.sharedstate.map) {
		if (!this.sharedstate.map[this.entry]) {
			this.sharedstate.map[this.entry] = this.defvalue;
		}
		return this.sharedstate.map[this.entry];
	}
	return this.defvalue;
}

StateElement.prototype.set = function(val) {
	if (this.sharedstate && this.sharedstate.map) {
		this.sharedstate.map[this.entry] = val;
		this.sharedstate.store();
	}
}

StateElement.prototype.setField = function(key, val) {
	if (this.sharedstate && this.sharedstate.map) {
		var submap = this.sharedstate.map[this.entry];
		submap[key] = val;
		this.sharedstate.store();
	}
}

StateElement.prototype.store = function() {
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

	return this; // for chaining
}

AutoWire.prototype.enableStorage = function(obj) {
	var props = Object.keys(obj);
	for (var p in props) {
		var k = props[p];
		if (obj[k] instanceof AutoWireStorage) {
			obj[k] = this.storageProvider;
		} else if (obj[k] instanceof StateElement) {
			this.attachStorageTo(obj[k]);
		}
	}
}

AutoWire.prototype.attachStorageTo = function(se) {
	if (!this.storageCategories[se.category]) {
		this.storageCategories[se.category] = new SharedState(this.storageProvider, se.category);
	}
	se.sharedstate = this.storageCategories[se.category];
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
	var elt = document.getElementById(ewi.label);
	obj[prop] = elt;
	if (ewi.storeAs) {
		this.attachStorageTo(ewi.storeAs);
		var val = ewi.storeAs.value();
		elt[ewi.valueField] = val;
		elt.addEventListener('change', ev => {
			ewi.storeAs.set(ev.target[ewi.valueField]);
		});
	}
}

AutoWire.prototype.callWithElements = function(fn, ...elts) {
	this.applyToArray(fn, elts);
	return this;
}

AutoWire.prototype.applyToArray = function(fn, elts) {
	for (var e of elts) {
		if (Array.isArray(e)) {
			this.applyToArray(fn, e);			
		} else {
			var elt = this.elementProvider.getElementById(e);
			if (!elt)
				throw new Error("there is no element: " + e);
			fn.call(null, elt);
		}
	}
}

AutoWire.prototype.elementListener = function(evname, fn, ...elts) {
	this.callWithElements(elt => elt.addEventListener(evname, fn), elts);

	return this;
}

/**
 * This class is used to share state between clients of the same category.
 * This is just used internally by Autowire and StateElement
 */

var SharedState = function(storage, category) {
	this.storage = storage;
	this.category = category;
	this.map = storage.currentState(category);
	if (!this.map) {
		this.map = {};
		this.store();
	}
}

SharedState.prototype.load = function() {
	this.map = this.storage.currentState(this.category);
}

SharedState.prototype.store = function() {
	this.storage.storeState(this.category, this.map);
}

export { ElementWithId, ControllerOfType, AutoWireStorage, StateElement, AutoWire };