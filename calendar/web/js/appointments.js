import { ControllerOfType, ElementWithId } from "./autowire.js";
import { CalDateTime } from "./events.js";
import { Ajax } from "./ajax.js";
import { ProfileModel } from "./profilemodel.js";

var Appointments = function() {
	this.ajax = new ControllerOfType(Ajax);
	this.profiles = new ControllerOfType(ProfileModel);

    this.newApptError = new ElementWithId('new-appointment-error');
	this.date = new ElementWithId('new-appointment-date');
	this.time = new ElementWithId('new-appointment-time');
	this.tz = new ElementWithId('new-appointment-tz');
	this.description = new ElementWithId('new-appointment-description');
    this.newApptCreate = new ElementWithId('add-new-appointment-button');
    this.cancel = new ElementWithId('cancel-new-appointment-button');
    this.modeController = new ElementWithId('mode-controller');
}

Appointments.prototype.init = function() {
	var self = this;
	this.newApptCreate.addEventListener('click', () => {
        self.createNewAppointment();
    });
	this.cancel.addEventListener('click', () => {
		this.modeController.className = 'standard-mode';
		self.reset();
	});
}

Appointments.prototype.reset = function() {
	this.date.value = '';
	this.time.value = '';
	this.description.value = '';
	this.newApptError.classList.remove("error-shown");
}

Appointments.prototype.createNewAppointment = function() {
	var self = this;
	var dateStr = this.date.value;
	var timeStr = this.time.value;
	var tz = this.tz.value;

	try {
		if (!dateStr || dateStr.length != 10) {
			throw new Error("invalid date");
		}
		if (timeStr && timeStr.length != 4) {
			throw new Error("invalid time");
		}
		if (!this.description.value) {
			throw new Error("no description provided");
		}
		this.ajax.secureUri("/ajax/new-appointment.php")
			.header('x-event-date', dateStr)
			.header('x-event-time', timeStr)
			.header('x-event-tz', tz)
			.header('x-event-desc', this.description.value)
			.invoke((stat, msg) => self.appointmentCreated(stat, msg));
		this.newApptError.classList.remove("error-shown");
	} catch (e) {
		console.log(e);
		this.newApptError.innerText = e.message;
		this.newApptError.classList.add("error-shown");
	}
}

Appointments.prototype.appointmentCreated = function(stat, msg) {
	var self = this;
	if (stat / 100 != 2) { // it's an error
		if (stat == 404) {
			msg = "404 - cannot create appointment";
		} else if (!msg) {
			msg = "Error " + stat;
		}
		this.newApptError.innerText = msg;
		this.newApptError.classList.add("error-shown");
	} else {
		if (this.profiles.activeCalendars['internal-calendar']) {
			this.modeController.className = 'standard-mode';
		} else {
			this.profiles.loadAvailableCalendars(() => self.chooseInternalCalendar());
		}
	}
}

Appointments.prototype.chooseInternalCalendar = function() {
	this.profiles.selectCalendarAction('internal-calendar', true);
	this.modeController.className = 'standard-mode';
}

export { Appointments };