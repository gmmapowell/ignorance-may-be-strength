var Ajax = function(tokenProvider, secureHdr) {
	this.tokenProvider = tokenProvider;
	this.secureHdr = secureHdr;
}

Ajax.prototype.secureUri = function(uri) {
	return new AjaxRequest(this, uri, true);
}

var AjaxRequest = function(ajax, uri, wantToken) {
	this.ajax = ajax;
	this.uri = uri;
	this.wantToken = wantToken;
	this.headers = {};
	this.hdlr = null;
}

AjaxRequest.prototype.header = function(hdr, val) {
	this.headers[hdr] = val;
	return this;
}

AjaxRequest.prototype.invoke = function(hdlr) {
	if (this.wantToken) {
		var tok = this.ajax.tokenProvider.getToken();
		if (!tok) {
			hdlr(401, "No token found");
			return;
		}
		this.headers[this.ajax.secureHdr] = tok;
	}
	ajax(this.uri, hdlr, null, null, "GET", this.headers);
}

function ajax(url, handler, ct, payload, verb, headers) {
	if (!verb) {
		if (ct != null || payload != null)
			verb = "POST";
		else
			verb = "GET";
	}
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = feedback(handler);
	xhr.open(verb, url, true);
	if (ct)
		xhr.setRequestHeader("Content-Type", ct);
	if (headers) {
		var hs = Object.keys(headers);
		for (var i=0;i<hs.length;i++) {
			xhr.setRequestHeader(hs[i], headers[hs[i]]);
		}
	}
	xhr.send(payload);
}
	
function feedback(handler) {
	return function() {
		if (this.readyState == 4) {
			handler(this.status, this.responseText);
		}
	}
}
  
export { ajax, Ajax };