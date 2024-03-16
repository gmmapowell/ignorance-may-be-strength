
function ajax(url, handler, ct, payload, headers) {
	var verb = "GET";
	if (ct != null || payload != null)
		verb = "POST";  
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
  
export { ajax };