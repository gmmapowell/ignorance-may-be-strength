import { ElementWithId } from "./autowire.js";

var Appointments = function() {
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
}

Appointments.prototype.createNewAppointment = function() {
	console.log("new appointment");
	this.newApptError.innerText = "An Error";
	this.newApptError.classList.add("error-shown");
}

export { Appointments };