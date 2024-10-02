import { ElementWithId, ControllerOfType } from "./autowire.js";
import { ModeOptions } from "./modeOptions.js";
import { ProfileModel } from "./profilemodel.js";
import { Profiles } from "./profiles.js";

var Hamburger = function() {
    this.profiles = new ControllerOfType(Profiles);
    this.model = new ControllerOfType(ProfileModel);

    this.button = new ElementWithId('hamburger-button');
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

    this.modeOptions = new ControllerOfType(ModeOptions);
}

Hamburger.prototype.init = function() {
    var self = this;
    this.button.addEventListener('click', () => self.toggleMe());
    this.signInButton.addEventListener('click', () => { 
        self.showSignInPanel();
    });
    this.chooseDatesButton.addEventListener('click', () => { 
        self.showChooseDatesPanel();
    });
    this.signOutButton.addEventListener('click', () => { 
        profiles.signOutNow();
        self.toggleMe(true);
    });

}

Hamburger.prototype.toggleMe = function(explicit) {
    console.log("show/hide hamburger");
    this.modeOptions.toggleHamburger();
    /*
    var menuMode = explicit != undefined ? explicit : isShown(this.menu);
    if (!menuMode) {
        hide(this.controlpanel);
        hide(this.feedback);
        hide(this.optionsDrawer);
        show(this.menu);
        show(this.padding);
        if (this.model.amSignedIn()) {
            hide(this.signInButton);
            show(this.signOutButton);
        } else {
            show(this.signInButton);
            hide(this.signOutButton);
        }
    } else {
        hide(this.menu);
        hide(this.padding);
        show(this.controlpanel);
        show(this.feedback);
    }
        */
}

Hamburger.prototype.showSignInPanel = function() {
    this.modeController.className = 'signing-in';
    this.modeOptions.classList.remove('show-hamburger');
    // show(this.narrowOptions)
    // show(this.optionsDrawer);
}

Hamburger.prototype.showChooseDatesPanel = function() {
    this.modeController.className = 'choose-dates';
    this.modeOptions.classList.remove('show-hamburger');
    // show(this.narrowOptions)
    // show(this.optionsDrawer);
}

export { Hamburger };