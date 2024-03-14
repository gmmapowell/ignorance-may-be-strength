import { ModelProvider } from "./model.js";

import { initCalendars } from "./controls.js";
import { Styling } from "./styling.js";
import { initSharing, shareJson, loadJsonFromFile, loadSharedJson } from "./sharing.js";
import { RedrawClz } from "./redraw.js";
import { initICS, loadICS } from "./ics.js";
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

	var scdiv = document.getElementById('select-calendars');
    var profileButton = document.getElementById('profile-button');

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

    var loadICSElt = document.getElementById("load-ics");
    var shareJsonElt = document.getElementById("share-as-json");
    var sharingFile = document.getElementById("sharing-file");
	var sharingUrl = document.getElementById('sharing-url');
    var loadShared = document.getElementById("load-shared");

    var urlEntry = document.getElementById("ics-url");

    // then create all the model objects
	var calendars = {};
	var colors = {};
    var profileModel = new ProfileModel();

    // then create all the actors
    var modelProvider = new ModelProvider(core, colors, calendars);
	var styler = new Styling(sections, print);
    var redraw = new RedrawClz(modelProvider, sections, styler);
//    var profiles = new Profiles(profileModel, signInPanel, signInEmail, signInPassword, submitSignIn, createUserPanel, createUserEmail, createUserYes, createUserNo, optionsDrawer, redraw);
    var profiles = new Profiles(profileModel, redraw, sections, signin);
    initCalendars(calendars, scdiv, redraw);
	initSharing(sharingFile, sharingUrl);
    initICS(urlEntry, redraw);
 
    // wire up events
    redraw.onChange(core['start-date']);
    redraw.onChange(core['end-date']);
    redraw.onChange(core['first-day']);
    redraw.onChange(core['shade-weekends']);

    redraw.onChange(print['page-size']);
    redraw.onChange(print['landscape']);

    profileButton.addEventListener('click', () => profiles.buttonClicked());

    loadICSElt.addEventListener('click', loadICS);
    shareJsonElt.addEventListener('click', shareJson);
    sharingFile.addEventListener('change', loadJsonFromFile);
    loadShared.addEventListener('click', loadSharedJson);

	addEventListener("beforeprint", ev => redraw.mode(false));
	addEventListener("resize", () => redraw.windowResized());
	addEventListener("afterprint", ev => redraw.mode(true));

    // initialize state
	core['start-date'].valueAsDate = new Date();
	core['end-date'].valueAsDate = new Date();

    // ok, show what we've got
	redraw.redraw();
}

window.addEventListener('load', init);
