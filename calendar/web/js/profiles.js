import { toggleHidden, hide, show } from "./utils.js";
import { ajax } from './ajax.js';

function Profiles(model, redraw, sections, elements) {
    var self = this;
    this.model = model;
    this.redraw = redraw;
    this.optionsDrawer = sections['options-drawer'];

    this.signInPanel = elements['sign-in-panel'];
    this.email  = elements.core['sign-in-email'];
    this.password = elements.core['sign-in-password'];
    this.signIn = elements.core['submit-sign-in'];

    this.createUserPanel = elements['create-user-panel'];
    this.createUserEmail = elements.newUser['create-user-email'];
    this.createUserYes = elements.newUser['create-user-yes'];
    this.createUserNo = elements.newUser['create-user-no'];

    this.signIn.addEventListener('click', () => self.doSignIn());
    this.createUserYes.addEventListener('click', () => self.createUser());
    this.createUserNo.addEventListener('click', () => self.hidePanel());
}

Profiles.prototype.buttonClicked = function() {
    if (this.model.amSignedIn()) {
        toggleHidden(this.profileDisplay, this.optionsDrawer);
    } else {
        toggleHidden(this.signInPanel, this.optionsDrawer);
    }
    this.redraw.redraw();
}

Profiles.prototype.hidePanel = function() {
    hide(this.optionsDrawer);
    hide(this.signInPanel);
    hide(this.createUserPanel);
}

Profiles.prototype.doSignIn = function() {
    var payload = {email: this.email.value, password: this.password.value};
    ajax("/ajax/signin.php", (stat, msg) => this.onSignIn(stat, msg), "application/json", JSON.stringify(payload));
}

Profiles.prototype.onSignIn = function(stat, msg) {
    if (stat != 200) {
        console.log("status:", stat, "msg:", msg);
        return;
    }
    var resp = JSON.parse(msg);
    switch (resp.action) {
        case "nouser": {
            // the user does not exist: do you want to create the user with the given password?
            this.createUserEmail.innerHTML = '';
            this.createUserEmail.appendChild(document.createTextNode(this.email.value));
            show(this.optionsDrawer);
            hide(this.signInPanel);
            show(this.createUserPanel);
            break;
        }
        case "loggedIn": {
            // the user successfully logged in, so store the (returned) token
            break;
        }
        case "failed": {
            // the password was incorrect, so alert the user
            break;
        }
    }
}

Profiles.prototype.createUser = function() {
    var payload = {email: this.email.value, password: this.password.value};
    ajax("/ajax/create-user.php", (stat, msg) => this.onSignIn(stat, msg), "application/json", JSON.stringify(payload));
}

export { Profiles };