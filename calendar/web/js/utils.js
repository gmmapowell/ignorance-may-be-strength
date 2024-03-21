
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

function equalsIgnoringCase(text, other) {
    return text.localeCompare(other, undefined, { sensitivity: 'base' }) === 0;
}

export { toggleHidden, show, hide, isShown, equalsIgnoringCase };