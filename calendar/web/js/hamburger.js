import { ElementWithId, ControllerOfType } from "./autowire.js";
import { ModelProvider } from "./model.js";
import { ModeOptions } from "./modeOptions.js";
import { ProfileModel } from "./profilemodel.js";
import { Profiles } from "./profiles.js";
import { RedrawClz } from "./redraw.js";
import { Styling } from "./styling.js";

var Hamburger = function() {
    this.profiles = new ControllerOfType(Profiles);
    this.model = new ControllerOfType(ProfileModel);
    this.modelProvider = new ControllerOfType(ModelProvider);
    this.redraw = new ControllerOfType(RedrawClz);
    this.styling = new ControllerOfType(Styling);

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

    this.overlayDate = new ElementWithId('overlay-date');
    this.overlayAppts = new ElementWithId('overlay-appts');

    this.touchTimer = null;
    this.touchedAt = null;
}

Hamburger.prototype.init = function() {
    var self = this;
    // this.feedback.addEventListener('click', () => self.toggleMe());
    this.feedback.addEventListener('touchstart', ev => self.startTouching(ev));
    this.feedback.addEventListener('touchmove', ev => self.startTouching(ev));
    this.feedback.addEventListener('touchend', ev => self.stopTouching(ev));
    this.feedback.addEventListener('touchcancel', ev => self.stopTouching(ev));
    this.menu.addEventListener('click', () => {
        self.modeOptions.hideHamburger();
    });
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

Hamburger.prototype.toggleMe = function() {
    this.modeOptions.toggleHamburger();
}

Hamburger.prototype.startTouching = function(ev) {
    // msg("touch");
    ev.preventDefault();
    var self = this;
    if (ev.targetTouches && ev.targetTouches[0]) {
        var tt = ev.targetTouches[0];
        this.touchedAt = this.styling.invert(tt.clientX, tt.clientY);
        // console.log("pos", this.touchedAt);
    }
    // console.log("state", this.touchTimer, this.modeOptions.showingOverlay());
    if (this.touchTimer != null)
        return;

    if (this.modeOptions.showingOverlay()) {
        this.showOverlayContents();
        return;
    }

    this.touchTimer = setTimeout(() => { 
        // msg("showing overlay on timeout");
        self.modeOptions.showOverlay();
        console.log("contents for", self.touchedAt);
        self.showOverlayContents();
        self.touchTimer = null;
    }, 250);
}

Hamburger.prototype.stopTouching = function(ev) {
    ev.preventDefault();
    // msg("no-touch");

    // console.log("timer", this.touchTimer);

    if (this.touchTimer) {
        // if it is a "click", clear the timer and show the hamburger menu
        // msg("launching menu");
        clearTimeout(this.touchTimer);
        this.touchTimer = null;
        this.toggleMe();
    } else if (this.modeOptions.showingOverlay()) {
        // if the timer went off, we showed the overlay, so hide it now
        // msg("hiding overlay")
        this.modeOptions.hideOverlay();
    }
}

Hamburger.prototype.showOverlayContents = function() {
    if (!this.touchedAt) {
        // nothing to show
        return;
    }
    var model = this.modelProvider.calculate();
    var day = model.weeks[this.touchedAt.y].days[this.touchedAt.x];
    console.log("day", day);
    this.overlayDate.innerText = day.calDate;
    this.overlayAppts.innerHTML = '';
    for (var i=0;i<day.toShow.length;i++) {
        var s = day.toShow[i];
        var div = document.createElement("div");
        this.overlayAppts.appendChild(div);
        div.className = 'overlay-appt';
        if (s.color) {
            div.classList.add("body-day-color-" + s.color);
        }
        var s1 = document.createElement("span");
        s1.className = "overlay-appt-time";
        s1.innerText = s.starttime;
        div.appendChild(s1);
        var s2 = document.createElement("span");
        s2.className = "overlay-appt-description";
        s2.innerText = s.description;
        div.appendChild(s2);
    }
}

var msg = function(tx) {
    var d = new Date();
    var ts = d.getSeconds().toString().padStart(2, '0') + "." + d.getMilliseconds().toString().padStart(3, '0');
    console.log(ts + " " + tx);
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