import { AutoWire } from './autowire.js';
import { ModeOptions } from './modeOptions.js';
import { ModelProvider } from "./model.js";
import { CalendarStorage } from "./storage.js";
import { ManageCalendars } from "./manage.js";

import { Styling } from "./styling.js";
import { RedrawClz } from "./redraw.js";
import { Profiles } from "./profiles.js";
import { ProfileModel } from "./profilemodel.js";
import { Hamburger } from "./hamburger.js";

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
    bindElement(sections, 'mode-controller');
    bindElement(sections, 'signed-in-controller');
    bindElement(sections, 'controls');
    bindElement(sections, 'options-drawer');
    bindElement(sections, 'feedback');

    var core = {};
    bindElement(core, 'start-date');
    bindElement(core, 'end-date');
    bindElement(core, 'first-day');
    bindElement(core, 'calendar-time-zone');
    bindElement(core, 'shade-weekends');

    var print = {};
    bindElement(print, 'page-size');
    bindElement(print, 'landscape');

    var profile = {};
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

    // create a wrapper around localStorage
    var storage = new CalendarStorage();

    // then create all the model objects
    var profileModel = new ProfileModel(storage);

    // then create all the actors
    var modelProvider = new ModelProvider(storage, core, profileModel);
	var styler = new Styling(storage, sections, print);
    var redraw = new RedrawClz(storage, modelProvider, sections, styler);
    var manageCalendars = new ManageCalendars();
    var profiles = new Profiles(storage, redraw);

    var modeOptions = new ModeOptions();
    var hamburger = new Hamburger(profiles, profileModel);
    new AutoWire(document, storage).wireUp(profileModel, modeOptions, profiles, hamburger, manageCalendars);

    profileModel.addPlan(modelProvider);
    profileModel.addVisual(profiles);
 
    // wire up events
    redraw.onChange(core['start-date']);
    redraw.onChange(core['end-date']);
    redraw.onChange(core['first-day']);
    core['calendar-time-zone'].addEventListener('change', ev => profileModel.changeTimeZone(core['calendar-time-zone'].selectedOptions[0].value));
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
    profileModel.changeTimeZone(storage.currentState('core').showTz);
    styler.restoreState();

    // ok, show what we've got
	redraw.redraw();
}

window.addEventListener('load', init);
