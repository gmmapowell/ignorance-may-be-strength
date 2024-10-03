import { ElementWithId, ControllerOfType } from "./autowire.js";
import { ModeOptions } from "./modeOptions.js";
import { ProfileModel } from "./profilemodel.js";
import { Profiles } from "./profiles.js";
import { RedrawClz } from "./redraw.js";

var Hamburger = function() {
    this.profiles = new ControllerOfType(Profiles);
    this.model = new ControllerOfType(ProfileModel);
    this.redraw = new ControllerOfType(RedrawClz);

    this.feedback = new ElementWithId('feedback');
    this.menu = new ElementWithId('hamburger-menu');
    this.modeController = new ElementWithId('mode-controller');
    this.feedback = new ElementWithId('feedback');
    this.narrowOptions = new ElementWithId('narrow-options');
    this.closeMenu = new ElementWithId('hamburger-close');
    this.signInButton = new ElementWithId('hamburger-sign-in');
    this.chooseDatesButton = new ElementWithId('hamburger-choose-dates');
    this.selectCalendars = new ElementWithId('hamburger-select-calendars');
    this.configureCategories = new ElementWithId('hamburger-configure-categories');
    this.doneSelecting = new ElementWithId('hamburger-done-selecting-button');
    this.resetAll = new ElementWithId('hamburger-reset');
    this.signOutButton = new ElementWithId('hamburger-sign-out');
    this.controlpanel = new ElementWithId('control-panel');
    this.optionsDrawer = new ElementWithId('options-drawer');
    this.apply = new ElementWithId('hamburger-controls-apply-button');

    this.modeOptions = new ControllerOfType(ModeOptions);
}

Hamburger.prototype.init = function() {
    var self = this;
    this.feedback.addEventListener('click', () => self.toggleMe());
    this.closeMenu.addEventListener('click', () => { 
        self.modeOptions.hideHamburger();
    });
    this.signInButton.addEventListener('click', () => { 
        self.showSignInPanel();
    });
    this.chooseDatesButton.addEventListener('click', () => { 
        self.showChooseDatesPanel();
    });
    this.selectCalendars.addEventListener('click', () => { 
        self.showCalendarsPanel();
    });
    this.configureCategories.addEventListener('click', () => { 
        self.showCategoriesPanel();
    });
    this.doneSelecting.addEventListener('click', () => {
        self.modeController.className = 'standard-mode';
        self.redraw.redraw();
    });
    this.resetAll.addEventListener('click', () => {
        // the reset is handled by the "doReset" listener at the top level
        // we just need to close the menu
        self.modeOptions.hideHamburger();
    });
    this.signOutButton.addEventListener('click', () => { 
        self.profiles.signOutNow();
        self.toggleMe(true);
    });
    this.apply.addEventListener('click', () => {
        self.modeController.className = 'standard-mode';
        self.modeOptions.hideHamburger();
        self.redraw.redraw();
    });
}

Hamburger.prototype.toggleMe = function(explicit) {
    this.modeOptions.toggleHamburger();
}

Hamburger.prototype.showSignInPanel = function() {
    this.modeController.className = 'signing-in';
    this.modeOptions.hideHamburger();
}

Hamburger.prototype.showChooseDatesPanel = function() {
    this.modeController.className = 'choose-dates';
    this.modeOptions.hideHamburger();
}

Hamburger.prototype.showCalendarsPanel = function() {
    this.modeController.className = 'select-calendars';
    this.modeOptions.hideHamburger();
}

Hamburger.prototype.showCategoriesPanel = function() {
    this.modeController.className = 'configure-categories';
    this.modeOptions.hideHamburger();
}

export { Hamburger };