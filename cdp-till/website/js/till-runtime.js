import { Repository } from "./repository.js";
import { RuntimeState } from "./state.js";

window.addEventListener('load', function(ev) {
	this.fetch("/till-code").then(resp => {
		if (!resp.ok) {
			console.log("Response err:", resp.status, resp.statusText)
			return
		}
		resp.json().then(json => {
			var repo = new Repository(json);
			var state = new RuntimeState();
			var init = repo.methods["init"];
			init.execute(state);
			console.log(state);
		});
	});
})
