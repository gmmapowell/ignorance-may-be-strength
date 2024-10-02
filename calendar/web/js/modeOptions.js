import { ElementWithId } from "./autowire.js";
import { ensureClass, removeClass, toggleClass } from "./utils.js";

/** Apart from the obvious thing that they all share a single div that they want to control,
 * the main reason for having all these methods in a single class is that I want the "business logic"
 * of what affects what to all be in one place.
 * 
 * This is very complicated because of the intersection of what may be on the screen with resizing events,
 * hamburgers and the like.  I don't want any inconsistencies, so I'm hoping that if I group everything
 * here, I will be able to see everything at a glance.
 * 
 * A vain hope, I realize ...
 */
var ModeOptions = function() {
	this.mydiv = new ElementWithId('mode-options');
}

ModeOptions.prototype.toggleHamburger = function() {
	return toggleClass('show-hamburger', this.mydiv);
}

ModeOptions.prototype.toggleProfile = function() {
	var applied = toggleClass('show-profile', this.mydiv);
	if (applied) {
		this.cleanSubProfiles();
		ensureClass('show-user-profile', this.mydiv);
	}
	return applied;
}

ModeOptions.prototype.openDrawer = function() {
	ensureClass('show-profile', this.mydiv);
	this.cleanSubProfiles();
	ensureClass('show-user-profile', this.mydiv);
}

ModeOptions.prototype.closeDrawer = function() {
	removeClass('show-profile', this.mydiv);
}

ModeOptions.prototype.showManage = function() {
	ensureClass('show-profile', this.mydiv);
	this.cleanSubProfiles();
	ensureClass('show-manage-calendars', this.mydiv);
}

ModeOptions.prototype.hideManage = function() {
	ensureClass('show-profile', this.mydiv);
	this.cleanSubProfiles();
	ensureClass('show-user-profile', this.mydiv);
}

ModeOptions.prototype.cleanSubProfiles = function() {
	removeClass('show-user-profile', this.mydiv);
	removeClass('show-manage-calendars', this.mydiv);
}

export { ModeOptions }