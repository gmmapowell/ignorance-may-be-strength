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

function init() {
    // create a wrapper around localStorage
    var storage = new CalendarStorage();

    // then create the model object
    var profileModel = new ProfileModel();
    
    // then create all the actors
    // TODO: REMOVE DIRECT REFERENCES TO STORAGE!!! (Use either StateElement or AutoWireStorage if you need the whole thing)
    var modelProvider = new ModelProvider(storage);
	var styler = new Styling(storage);
    var redraw = new RedrawClz(storage);
    var manageCalendars = new ManageCalendars();
    var profiles = new Profiles(storage);
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
        .wireUp(profileModel, modelProvider, modeOptions, profiles, redraw, styler, hamburger, manageCalendars)
        .callWithElements(elt => redraw.onChange(elt), 'start-date', 'end-date', 'first-day', 'shade-weekends', 'page-size', 'landscape')
        .elementListener('change', ev => profileModel.changeTimeZone(ev.target.selectedOptions[0].value), 'calendar-time-zone')
        .elementListener('click', ev => profiles.buttonClicked(), 'profile-button')
        .elementListener('click', doReset, 'user-profile-reset');

    // Add specific global event listeners
	addEventListener("beforeprint", ev => redraw.mode(false));
	addEventListener("resize", () => redraw.windowResized());
	addEventListener("afterprint", ev => redraw.mode(true));

    // I think these should all go into "init"
    modelProvider.restoreState();
    profileModel.changeTimeZone(storage.currentState('core').showTz);
    styler.restoreState();

    // ok, show what we've got - this shouldn't be necessary, but just in case ...
	redraw.redraw();
}

window.addEventListener('load', init);
