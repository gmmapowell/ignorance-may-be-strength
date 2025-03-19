import { Repository } from "./repository.js";

window.addEventListener('load', function(ev) {
	this.fetch("/till-code").then(resp => {
		if (!resp.ok) {
			console.log("Response err:", resp.status, resp.statusText)
			return
		}
		resp.json().then(json => {
			var repo = new Repository(json);
		});
	});
})
