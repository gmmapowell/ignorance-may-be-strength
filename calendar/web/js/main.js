import { ModelProvider } from "./model.js";
import { CalendarStorage } from "./storage.js";
import { ManageCalendars } from "./manage.js";

import { Styling } from "./styling.js";
import { RedrawClz } from "./redraw.js";
import { Profiles } from "./profiles.js";
import { ProfileModel } from "./profilemodel.js";

function bindElement(into, name) {
    var elt = document.getElementById(name);
    if (!elt) {
        throw new Error("there is no element called " + name);
    }
    into[name] = elt;
}

function init() {
    // First get all the elements from the document
    var sections = {};
    bindElement(sections, 'controls');
    bindElement(sections, 'options-drawer');
    bindElement(sections, 'feedback');

    var core = {};
    bindElement(core, 'start-date');
    bindElement(core, 'end-date');
    bindElement(core, 'first-day');
    bindElement(core, 'shade-weekends');

    var print = {};
    bindElement(print, 'page-size');
    bindElement(print, 'landscape');

    var profile = {};
	var scdiv = document.getElementById('select-calendars');
    bindElement(profile, 'profile-button');
    bindElement(profile, 'sign-in-button');
    bindElement(profile, 'open-profile-button');

    var userProfile = {};
    bindElement(userProfile, 'user-profile-panel');
    bindElement(userProfile, 'manage-calendars-button');
    bindElement(userProfile, 'save-current-calendar');
    bindElement(userProfile, 'download-current-calendar');
    bindElement(userProfile, 'user-profile-reset');
    bindElement(userProfile, 'user-profile-sign-out');
    bindElement(userProfile, 'drop-for-upload');
    bindElement(userProfile, 'available-calendars');
    bindElement(userProfile, 'calendar-categories');
    bindElement(userProfile, 'saved-plans');

    var manageCalendars = {};
    bindElement(manageCalendars, 'manage-calendars-panel');

    var signin = {};
    bindElement(signin, 'sign-in-panel');
    signin.core = {};
    bindElement(signin.core, 'sign-in-email');
    bindElement(signin.core, 'sign-in-password');
    bindElement(signin.core, 'submit-sign-in');

    signin.newUser = {};
    bindElement(signin, 'create-user-panel');
    bindElement(signin.newUser, 'create-user-yes');
    bindElement(signin.newUser, 'create-user-no');
    bindElement(signin.newUser, 'create-user-email');

    bindElement(signin, 'email-panel');
    bindElement(signin, 'invalid-signin-panel');
    bindElement(signin, 'invalid-email-panel');
    bindElement(signin, 'invalid-password-panel');

    // create a wrapper around localStorage
    var storage = new CalendarStorage();

    // then create all the model objects
    var profileModel = new ProfileModel(storage);

    // then create all the actors
    var modelProvider = new ModelProvider(storage, core, profileModel);
	var styler = new Styling(storage, sections, print);
    var redraw = new RedrawClz(storage, modelProvider, sections, styler);
    var manageCalendarsActor = new ManageCalendars(manageCalendars);
    var profiles = new Profiles(storage, profileModel, redraw, manageCalendarsActor, sections, profile, signin, userProfile, manageCalendars);
    profileModel.addPlan(modelProvider);
    profileModel.addVisual(profiles);
 
    // wire up events
    redraw.onChange(core['start-date']);
    redraw.onChange(core['end-date']);
    redraw.onChange(core['first-day']);
    redraw.onChange(core['shade-weekends']);

    redraw.onChange(print['page-size']);
    redraw.onChange(print['landscape']);

    profile['profile-button'].addEventListener('click', () => profiles.buttonClicked());
    userProfile['user-profile-reset'].addEventListener('click', () => {
        modelProvider.reset();
        profileModel.reset();
        styler.reset();
        profiles.modelChanged();
        profiles.closeDrawer();
    });

	addEventListener("beforeprint", ev => redraw.mode(false));
	addEventListener("resize", () => redraw.windowResized());
	addEventListener("afterprint", ev => redraw.mode(true));

    modelProvider.restoreState();
    styler.restoreState();

    // ok, show what we've got
	redraw.redraw();
}

window.addEventListener('load', init);
