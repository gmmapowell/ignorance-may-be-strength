import { ElementWithId, ControllerOfType } from "./autowire.js";
import { ModeOptions } from "./modeOptions.js";
import { ProfileModel } from "./profilemodel.js";
import { Profiles } from "./profiles.js";
import { RedrawClz } from "./redraw.js";

var Hamburger = function() {
    this.profiles = new ControllerOfType(Profiles);
    this.model = new ControllerOfType(ProfileModel);
    this.redraw = new ControllerOfType(RedrawClz);

    this.button = new ElementWithId('hamburger-button');
    this.feedback = new ElementWithId('feedback');
    this.menu = new ElementWithId('hamburger-menu');
    this.padding = new ElementWithId('hamburger-padding');
    this.modeController = new ElementWithId('mode-controller');
    this.feedback = new ElementWithId('feedback');
    this.narrowOptions = new ElementWithId('narrow-options');
    this.signInButton = new ElementWithId('hamburger-sign-in');
    this.chooseDatesButton = new ElementWithId('hamburger-choose-dates');
    this.signOutButton = new ElementWithId('hamburger-sign-out');
    this.controlpanel = new ElementWithId('control-panel');
    this.optionsDrawer = new ElementWithId('options-drawer');
    this.apply = new ElementWithId('hamburger-controls-apply-button');

    this.modeOptions = new ControllerOfType(ModeOptions);
}

Hamburger.prototype.init = function() {
    var self = this;
    this.feedback.addEventListener('click', () => self.toggleMe());
    this.signInButton.addEventListener('click', () => { 
        self.showSignInPanel();
    });
    this.chooseDatesButton.addEventListener('click', () => { 
        self.showChooseDatesPanel();
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
    console.log("show/hide hamburger");
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

export { Hamburger };