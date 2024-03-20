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

CalendarStorage.prototype.storeState = function(state) {
    localStorage.setItem("state", JSON.stringify(state));
}

CalendarStorage.prototype.currentState = function() {
    return JSON.parse(localStorage.getItem("state"));
}

export { CalendarStorage };