import { ControllerOfType, ElementWithId } from "./autowire.js";
import { CalDateTime } from "./events.js";
import { Ajax } from "./ajax.js";

var Appointments = function() {
	this.ajax = new ControllerOfType(Ajax);

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
		var dd = CalDateTime.standard(tz, dateStr + ":" + timeStr.substring(0, 2) + ":" + timeStr.substring(2));
		this.ajax.secureUri("/ajax/new-appointment.php")
			.header('x-event-when', dd.toISOString())
			.header('x-event-tz', tz)
			.header('x-event-desc', this.description.value)
			.invoke((stat, msg) => self.appointmentCreated(stat, msg));
	} catch (e) {
		console.log(e);
		this.newApptError.innerText = e.value;
		this.newApptError.classList.add("error-shown");
	}
}

Appointments.prototype.appointmentCreated = function(stat, msg) {
	if (stat / 100 != 2) { // it's an error
		if (stat == 404) {
			msg = "404 - cannot create appointment";
		} else if (!msg) {
			msg = "Error " + stat;
		}
		this.newApptError.innerText = msg;
		this.newApptError.classList.add("error-shown");
	}
}

export { Appointments };