
function setMode(elt, mode) {
    elt.className = mode;
}

function hasClass(elt, clz) {
    return elt.classList.contains(clz);
}

function toggleClass(clz, ...elts) {
    if (!elts || elts.length == 0)
        throw new Error("must specify at least one element");
    var anyApplied = false;
    for (var elt of elts) {
        if (elt.classList.contains(clz)) {
            elt.classList.remove(clz);
        } else {
            elt.classList.add(clz);
            anyApplied = true;
        }
    }
    return anyApplied;
}

function ensureClass(clz, ...elts) {
    if (!elts || elts.length == 0)
        throw new Error("must specify at least one element");
    for (var elt of elts) {
        if (!elt.classList.contains(clz)) {
            elt.classList.add(clz);
        }
    }
}

function removeClass(clz, ...elts) {
    if (!elts || elts.length == 0)
        throw new Error("must specify at least one element");
    for (var elt of elts) {
        if (elt.classList.contains(clz)) {
            elt.classList.remove(clz);
        }
    }
}

function equalsIgnoringCase(text, other) {
    return text.localeCompare(other, undefined, { sensitivity: 'base' }) === 0;
}

export { toggleClass, ensureClass, removeClass, hasClass, setMode, equalsIgnoringCase };