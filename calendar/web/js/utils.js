
function toggleHidden(elt, container) {
    if (elt.classList.contains("hidden")) {
        elt.classList.remove("hidden");
        if (container)
            container.classList.remove("hidden");
    } else {
        elt.classList.add("hidden");
        if (container)
            container.classList.add("hidden");
    }
}

function show(elt) {
    if (elt.classList.contains("hidden")) {
        elt.classList.remove("hidden");
    }
}

function hide(elt) {
    if (!elt.classList.contains("hidden")) {
        elt.classList.add("hidden");
    }
}

export { toggleHidden, show, hide };