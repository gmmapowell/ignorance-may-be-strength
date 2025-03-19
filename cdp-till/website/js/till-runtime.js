import { LayoutEngine } from "./layoutengine.js";
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
			var state = new RuntimeState(repo.buttons);
			var init = repo.methods["init"];
			init.execute(state);
			var engine = new LayoutEngine(document);
			engine.layout(repo.layouts["main"], state);
		});
	});
})
