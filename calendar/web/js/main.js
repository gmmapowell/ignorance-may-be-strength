import { AutoWire } from './autowire.js';
import { ModeOptions } from './modeOptions.js';
import { ModelProvider } from "./model.js";
import { CalendarStorage } from "./storage.js";
import { ManageCalendars } from "./manage.js";
import { Ajax } from "./ajax.js";
import { Styling } from "./styling.js";
import { RedrawClz } from "./redraw.js";
import { Profiles } from "./profiles.js";
import { ProfileModel } from "./profilemodel.js";
import { Hamburger } from "./hamburger.js";

function init() {
    // create a wrapper around localStorage
    var storage = new CalendarStorage();
    var ajax = new Ajax(storage, "x-identity-token");

    // then create the model object
    var profileModel = new ProfileModel();
    
    // then create all the actors
    var modelProvider = new ModelProvider();
	var styler = new Styling();
    var redraw = new RedrawClz();
    var manageCalendars = new ManageCalendars();
    var profiles = new Profiles();
    var modeOptions = new ModeOptions();
    var hamburger = new Hamburger();

    // the reset function refers to many of these but is called in AutoWire
    var doReset = function() {
        modelProvider.reset();
        profileModel.reset();
        styler.reset();
        profiles.modelChanged();
        profiles.closeDrawer();
    }

    // then get everything wired together
    new AutoWire(document, storage)
        .wireUp(ajax, profileModel, modelProvider, modeOptions, profiles, redraw, styler, hamburger, manageCalendars)
        .elementListener('change', ev => redraw.redraw(), 'start-date', 'end-date', 'first-day', 'shade-weekends', 'page-size', 'landscape')
        .elementListener('change', ev => profileModel.changeTimeZone(ev.target.selectedOptions[0].value), 'calendar-time-zone')
        .elementListener('click', ev => profiles.buttonClicked(), 'profile-button')
        .elementListener('click', doReset, 'user-profile-reset', 'hamburger-reset');

    // Make sure redraw happens continuously
	addEventListener("beforeprint", ev => redraw.mode(false));
	addEventListener("resize", () => redraw.windowResized());
	addEventListener("afterprint", ev => redraw.mode(true));
	redraw.redraw();
}

window.addEventListener('load', init);
