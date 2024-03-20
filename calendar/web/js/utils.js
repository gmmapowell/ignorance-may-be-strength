
function isShown(elt) {
    return !elt.classList.contains("hidden");
}

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

function show(...elts) {
    for (var elt of elts) {
        if (elt.classList.contains("hidden")) {
            elt.classList.remove("hidden");
        }
    }
}

function hide(...elts) {
    for (var elt of elts) {
        if (!elt.classList.contains("hidden")) {
            elt.classList.add("hidden");
        }
    }
}

export { toggleHidden, show, hide, isShown };