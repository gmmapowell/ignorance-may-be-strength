var pre = document.getElementById("source-code");

fetch("http://localhost:1399/src/cafe.till").then(resp => {
	console.log(resp.status, resp.statusText);
	resp.text().then(src => {
		pre.innerText = src;
	});
});
  