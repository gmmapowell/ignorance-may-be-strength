function CalendarStorage() {
    this.profileListeners = [];
}

CalendarStorage.prototype.addProfileListener = function(cb) {
    this.profileListeners.push(cb);
}

CalendarStorage.prototype.hasToken = function() {
    if (localStorage.getItem("token"))
        return true;
    else
        return false;
}

CalendarStorage.prototype.getToken = function() {
    var tok = localStorage.getItem("token");
    return tok;
}

CalendarStorage.prototype.bindToken = function(tok) {
    localStorage.setItem("token", tok);
    for (var i=0;i<this.profileListeners.length;i++) {
        this.profileListeners[i].signedIn();
    }
}

CalendarStorage.prototype.clearToken = function() {
    localStorage.removeItem("token");
    for (var i=0;i<this.profileListeners.length;i++) {
        this.profileListeners[i].signedOut();
    }
}

CalendarStorage.prototype.clear = function() {
    localStorage.removeItem("token");
    localStorage.removeItem("state");
}

CalendarStorage.prototype.storeState = function(category, state) {
    var curr = localStorage.getItem("state");
    if (curr) {
        curr = JSON.parse(curr);
    } else {
        curr = {};
    }
    curr[category] = state;
    localStorage.setItem("state", JSON.stringify(curr));
}

CalendarStorage.prototype.currentState = function(category) {
    var state = localStorage.getItem("state");
    if (!state) {
        return null;
    }
    state = JSON.parse(state);
    return state[category];
}

export { CalendarStorage };