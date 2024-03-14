function CalendarStorage() {

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
}

CalendarStorage.prototype.clearToken = function() {
    localStorage.removeItem("token");
}

export { CalendarStorage };