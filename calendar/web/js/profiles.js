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

    this.emailPanel = elements['email-panel'];
    this.invalidEmailPanel = elements['invalid-email-panel'];
    this.invalidPasswordPanel = elements['invalid-password-panel'];
    this.invalidSigninPanel = elements['invalid-signin-panel'];

    this.signIn.addEventListener('click', () => self.doSignIn());
    this.createUserYes.addEventListener('click', () => self.createUser());
    this.createUserNo.addEventListener('click', () => self.hidePanel());
}

Profiles.prototype.buttonClicked = function() {
    if (this.model.amSignedIn()) {
        toggleHidden(this.profileDisplay, this.optionsDrawer);
    } else {
        toggleHidden(this.signInPanel, this.optionsDrawer);
        show(this.emailPanel);
        hide(this.invalidSigninPanel)
        hide(this.invalidEmailPanel);
        hide(this.invalidPasswordPanel);
    }
    this.redraw.redraw();
}

Profiles.prototype.hidePanel = function() {
    hide(this.optionsDrawer);
    hide(this.signInPanel);
    hide(this.createUserPanel);
    this.email.value = '';
    this.password.value = '';
}

Profiles.prototype.doSignIn = function() {
    var payload = {email: this.email.value, password: this.password.value};
    ajax("/ajax/signin.php", (stat, msg) => this.handleResponse(stat, msg, "signin"), "application/json", JSON.stringify(payload));
}

Profiles.prototype.createUser = function() {
    var payload = {email: this.email.value, password: this.password.value};
    ajax("/ajax/create-user.php", (stat, msg) => this.handleResponse(stat, msg, "create"), "application/json", JSON.stringify(payload));
}

Profiles.prototype.handleResponse = function(stat, msg, mode) {
    if (stat != 200) {
        console.log("status:", stat, "msg:", msg);
        return;
    }
    var resp = JSON.parse(msg);
    console.log(resp);
    switch (resp.action) {
        case "invalid-email": {
            // if the user is trying to create an account, this is a special message that they cannot use that email;
            // otherwise it is just a "failure"
            if (mode == "create") {
                show(this.optionsDrawer);
                hide(this.invalidSigninPanel)
                show(this.signInPanel);
                show(this.invalidEmailPanel);
                show(this.emailPanel);
                hide(this.invalidPasswordPanel);
                hide(this.createUserPanel);
            } else {
                this.signinFailed();
            }
            break;
        }
        case "no-user": {
            // the user does not exist: do you want to create the user with the given password?
            this.createUserEmail.innerHTML = '';
            this.createUserEmail.appendChild(document.createTextNode(this.email.value));
            show(this.optionsDrawer);
            hide(this.signInPanel);
            show(this.createUserPanel);
            break;
        }
        case "invalid-password": {
            // when creating a user, the password they requested was invalid, so get a new one
            show(this.optionsDrawer);
            show(this.signInPanel)
            hide(this.invalidSigninPanel);
            hide(this.createUserPanel);
            hide(this.emailPanel);
            show(this.invalidPasswordPanel);
            break;
        }
        case "user-created":
        case "signed-in": {
            // the user successfully logged in, so store the (returned) token
            this.hidePanel();
            break;
        }
        case "signin-failed": {
            // the email/password was incorrect, so alert the user
            this.signinFailed();
            break;
        }
    }
    this.redraw.redraw();
}

Profiles.prototype.signinFailed = function() {
    show(this.optionsDrawer);
    show(this.invalidSigninPanel);
    show(this.signInPanel);
    hide(this.invalidEmailPanel);
    show(this.emailPanel);
    hide(this.invalidPasswordPanel);
    hide(this.createUserPanel);
}

export { Profiles };