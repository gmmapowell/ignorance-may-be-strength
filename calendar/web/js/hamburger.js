import { hide, show, isShown } from "./utils.js";

var Hamburger = function(elts, profiles, model) {
    var self = this;
    this.profiles = profiles;
    this.model = model;
    this.button = elts['hamburger-button'];
    this.menu = elts['hamburger-menu'];
    this.padding = elts['hamburger-padding'];
    this.feedback = elts['feedback'];
    this.narrowOptions = elts['narrow-options'];
    this.signInButton = elts['hamburger-sign-in'];
    this.signOutButton = elts['hamburger-sign-out'];
    this.controlpanel = elts['control-panel'];
    this.optionsDrawer = elts['options-drawer'];
    this.button.addEventListener('click', () => self.toggleMe());
    this.signInButton.addEventListener('click', () => { 
        self.toggleMe(false);
        self.showSignInPanel();
    });
    this.signOutButton.addEventListener('click', () => { 
        profiles.signOutNow();
        self.toggleMe(true);
    });

}

Hamburger.prototype.toggleMe = function(explicit) {
    console.log("show/hide hamburger");
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
}

Hamburger.prototype.showSignInPanel = function() {
    show(this.narrowOptions)
    show(this.optionsDrawer);
}

export { Hamburger };