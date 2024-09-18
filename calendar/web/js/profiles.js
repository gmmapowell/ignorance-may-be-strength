import { toggleHidden, hide, show, isShown } from "./utils.js";
import { ajax } from './ajax.js';

function Profiles(storage, model, redraw, manageCalendarsActor, sections, profileElts, elements, userProfile, manageCalendars) {
    var self = this;
    this.storage = storage;
    this.model = model;
    this.redraw = redraw;
    this.optionsDrawer = sections['options-drawer'];
    this.manageCalendarsActor = manageCalendarsActor;

    this.profileElts = profileElts;

    this.signInPanel = elements['sign-in-panel'];
    this.email  = elements.core['sign-in-email'];
    this.password = elements.core['sign-in-password'];
    this.signIn = elements.core['submit-sign-in'];

    this.manageCalendarsElts = manageCalendars;
    this.manageCalendarsPanel = manageCalendars['manage-calendars-panel'];

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

    this.profileDisplay = userProfile['user-profile-panel'];
    this.availableCalendars = userProfile['available-calendars'];
    this.calendarCategories = userProfile['calendar-categories'];
    this.savedPlans = userProfile['saved-plans'];
    userProfile['user-profile-sign-out'].addEventListener('click', () => self.signOutNow());
    this.prepareDropUpload(userProfile['drop-for-upload']);

    this.manageCalendarsButton = userProfile['manage-calendars-button'];
    this.manageCalendarsButton.addEventListener('click', () => this.showManage());

    this.saveCalendarButton = userProfile['save-current-calendar'];
    this.saveCalendarButton.addEventListener('click', () => this.redraw.saveCurrentCalendar(() => this.model.loadAvailableCalendars()));

    this.downloadCalendarButton = userProfile['download-current-calendar'];
    this.downloadCalendarButton.addEventListener('click', () => this.redraw.downloadCurrentCalendar());

    this.updateSignedIn();
}

Profiles.prototype.prepareDropUpload = function(targetZone) {
    targetZone.addEventListener('dragenter', ev => this.fileDraggedOver(ev));
    targetZone.addEventListener('dragover', ev => this.fileDraggedOver(ev));
    targetZone.addEventListener('drop', ev => this.droppedFile(ev));
}

Profiles.prototype.fileDraggedOver = function(ev) {
    // console.log(ev.type, ev);
    ev.preventDefault();
}

Profiles.prototype.droppedFile = function(ev) {
    ev.preventDefault();
    var dt = ev.dataTransfer;
    var files = dt.files;
    // console.log(files);
    for (var i=0;i<files.length;i++) {
        this.uploadFile(files[i]);
    }
}

Profiles.prototype.uploadFile = function(f) {
    if (!f.name.endsWith(".ics") && !f.name.endsWith(".json") && !f.name.endsWith(".csv")) {
        console.log("ignoring", f);
        return;
    }
    var opts = {};
    opts['x-identity-token'] = this.storage.getToken();
    opts['x-file-name'] = encodeURIComponent(f.name);
    ajax("/ajax/upload.php", (stat, msg) => this.uploadComplete(stat, msg), f.type, f, "PUT", opts);
}

Profiles.prototype.uploadComplete = function(stat, msg) {
    console.log("ajax: " + stat + " " + msg);
    this.model.loadAvailableCalendars();
}

Profiles.prototype.updateSignedIn = function() {
    if (this.model.amSignedIn()) {
        show(this.profileElts['open-profile-button']);
        hide(this.profileElts['sign-in-button']);
    } else {
        hide(this.profileElts['open-profile-button']);
        show(this.profileElts['sign-in-button']);
    }
}

Profiles.prototype.buttonClicked = function() {
    if (this.model.amSignedIn()) {
        toggleHidden(this.profileDisplay, this.optionsDrawer);
        this.model.drawerOpen(isShown(this.optionsDrawer));
    } else {
        toggleHidden(this.signInPanel, this.optionsDrawer);
        show(this.emailPanel);
        hide(this.invalidSigninPanel)
        hide(this.invalidEmailPanel);
        hide(this.invalidPasswordPanel);
    }
    this.redraw.redraw();
}

Profiles.prototype.showManage = function() {
    // toggleHidden(this.signInPanel, this.optionsDrawer);
    hide(this.profileDisplay);
    hide(this.emailPanel);
    hide(this.invalidSigninPanel)
    hide(this.invalidEmailPanel);
    hide(this.invalidPasswordPanel);
    show(this.manageCalendarsPanel);
    this.manageCalendarsActor.redraw();
    this.redraw.redraw();
}

Profiles.prototype.hideManage = function() {
    // toggleHidden(this.signInPanel, this.optionsDrawer);
    show(this.profileDisplay);
    hide(this.emailPanel);
    hide(this.invalidSigninPanel)
    hide(this.invalidEmailPanel);
    hide(this.invalidPasswordPanel);
    hide(this.manageCalendarsPanel);
    this.manageCalendarsActor.redraw();
    this.redraw.redraw();
}

Profiles.prototype.openDrawer = function() {
    show(this.profileDisplay, this.optionsDrawer);
    this.redraw.redraw();
}

Profiles.prototype.closeDrawer = function() {
    hide(this.optionsDrawer);
    hide(this.profileDisplay);
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
            this.storage.bindToken(resp.token);
            this.updateSignedIn();
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

Profiles.prototype.signOutNow = function() {
    if (this.storage.hasToken()) {
        var payload = { token: this.storage.getToken() };
        ajax("/ajax/signout.php", (stat, msg) => this.logSignOutResponse(stat, msg), "application/json", JSON.stringify(payload));
        this.storage.clearToken();
    }
    this.updateSignedIn();
    hide(this.profileDisplay);
    this.hidePanel();
}

Profiles.prototype.logSignOutResponse = function(stat, msg) {
    debugger;
    if (stat / 100 != 2) {
        console.log("sign out response was", stat, msg);
    }
}

Profiles.prototype.updateCalendarList = function(cals) {
    this.availableCalendars.innerHTML = '';
    this.availableCalendars.appendChild(document.createTextNode("Choose Calendars"));
    var ks = Object.keys(cals).sort();
    for (var i=0;i<ks.length;i++) {
        var k = ks[i];
        var elt = document.createElement("div");
        elt.className = 'choose-calendar';
        var cb = document.createElement("input");
        cb.name = 'cal-cb-' + i;
        cb.type = 'checkbox';
        cb.checked = cals[k];
        this.addCalendarListener(cb, k);
        elt.appendChild(cb);
        var label = document.createTextNode(k);
        elt.appendChild(label);
        this.availableCalendars.appendChild(elt);
    }
}

Profiles.prototype.updateCategories = function() {
    var cats = this.model.categories();
    this.calendarCategories.innerHTML = '';
    this.calendarCategories.appendChild(document.createTextNode("Configure Categories"));
    var catn = 0;
    for (const c of cats) {
        var config = this.model.category(c);
        var elt = document.createElement("div");
        var label = document.createTextNode(c);
        elt.appendChild(label);
        var picker = makeColorPicker(catn, config.color);
        elt.appendChild(picker);
        this.addCategoryListener(picker, c);
        this.calendarCategories.appendChild(elt);

        catn++;
    }
}

Profiles.prototype.updatePlansList = function(plans) {
    this.savedPlans.innerHTML = '';
    var titleElt = document.createElement("div");
    titleElt.className = "saved-plans-title";
    titleElt.appendChild(document.createTextNode("Saved Plans"));
    this.savedPlans.appendChild(titleElt);
    for (var plan of plans) {
        var elt = document.createElement("div");
        elt.className = 'choose-saved-plan';
        var button = document.createElement("input");
        button.type = 'button';
        button.value = plan;
        this.addPlanListener(button, plan);
        elt.appendChild(button);
        this.savedPlans.appendChild(elt);
    }
}

var colors = [ '--', 'blue', 'green', 'pink', 'red', 'yellow' ];

function makeColorPicker(catn, chosen) {
    var ret = document.createElement("select");
    ret.name = "select-cat-" + catn;
    for (var c of colors) {
        var opt = document.createElement("option");
        opt.value = c;
        if (c == chosen) {
            opt.selected = true;
        }
        opt.appendChild(document.createTextNode(c));
        ret.appendChild(opt);
    }
    return ret;
}

Profiles.prototype.addCalendarListener = function(cb, label) {
    cb.addEventListener('change', () => {
        this.model.selectCalendar(label, cb.checked);

        // we will need to redraw after the calendar has been successfully loaded
        // this is done in modelChanged()
        // this.redraw.redraw();
    });
}

Profiles.prototype.addCategoryListener = function(picker, label) {
    picker.addEventListener('change', () => {
        this.model.chooseCategoryColor(label, picker.selectedOptions[0].value);

        // we will need to redraw after the calendar has been successfully loaded
        // this is done in modelChanged()
        // this.redraw.redraw();
    });
}

Profiles.prototype.addPlanListener = function(button, plan) {
    button.addEventListener('click', () => {
        this.closeDrawer();
        this.model.loadPlan(plan);
    });
}

Profiles.prototype.modelChanged = function() {
    this.updateCalendarList(this.model.availableCalendars);
    this.manageCalendarsActor.redraw();
    this.updatePlansList(this.model.savedPlans);
    this.updateCategories();
    this.model.changeTimeZone(null, "do-not-notify");
    this.redraw.redraw();
}

export { Profiles };