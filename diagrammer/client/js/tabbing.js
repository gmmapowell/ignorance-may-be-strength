import { applyToAll, applyToDiv } from "./jstda.js";

function selectTab(tab) {
	applyToAll(".tab-title", n => n.classList.remove("selected-tab"));
	applyToAll(".tab-body", n => n.classList.remove("selected-tab"));
	applyToDiv(".tab-title." + tab, n => n.classList.add("selected-tab"));
	applyToDiv(".tab-body." + tab, n => n.classList.add("selected-tab"));
}

function selectDiagramTab(name) {
	applyToAll(".tab-title", n => n.classList.remove("selected-tab"));
	applyToAll(".tab-body", n => n.classList.remove("selected-tab"));
	applyToDiv(".tab-title[data-diagram-for='" + name + "']", n => n.classList.add("selected-tab"));
	applyToDiv(".tab-body[data-diagram-for='" + name + "']", n => n.classList.add("selected-tab"));
}

export { selectTab, selectDiagramTab };