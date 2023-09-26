import { selectTab } from "./tabbing.js";

class ErrorReporter {
	constructor() {
		this.errors = [];
	}

	hasErrors() {
		return this.errors.length > 0;
	}

	raise(s) {
		console.log("error: " + s);
		this.errors.push(s);
	}

	show(elt) {
		elt.innerHTML = '';
		for (var i=0;i<this.errors.length;i++) {
			var msgdiv = document.createElement("div");
			msgdiv.className = "error-message";
			var msgtext = document.createTextNode(this.errors[i]);
			msgdiv.appendChild(msgtext);
			elt.appendChild(msgdiv);
		}

		selectTab("error-tab");
	}

	unhide(elt) {
		elt.classList.remove("hidden");
	}

	hide(elt) {
		elt.classList.add("hidden");
	}
}

export default ErrorReporter;