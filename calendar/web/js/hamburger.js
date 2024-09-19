// import { hide, show, isShown } from "./utils.js";

var Hamburger = function(elts, profiles, model) {
    var self = this;
    this.profiles = profiles;
    this.model = model;
    this.button = elts['hamburger-button'];
    this.menu = elts['hamburger-menu'];
    this.padding = elts['hamburger-padding'];
    this.modeController = elts['mode-controller'];
    this.modeOptions = elts['mode-options'];
    this.feedback = elts['feedback'];
    this.narrowOptions = elts['narrow-options'];
    this.signInButton = elts['hamburger-sign-in'];
    this.chooseDatesButton = elts['hamburger-choose-dates'];
    this.signOutButton = elts['hamburger-sign-out'];
    this.controlpanel = elts['control-panel'];
    this.optionsDrawer = elts['options-drawer'];
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
    var haveMenu = this.modeOptions.classList.contains('show-hamburger');
    if (!haveMenu) {
        this.modeOptions.classList.add('show-hamburger');
    } else {
        this.modeOptions.classList.remove('show-hamburger');
    }
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