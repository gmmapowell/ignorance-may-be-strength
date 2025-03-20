var tbody = document.getElementById("source-code");

fetch("http://localhost:1399/src/cafe.till").then(resp => {
	resp.text().then(src => {
		tbody.innerHTML = '';
		var lines = src.split(/\r?\n/g);
		for (var i=0;i<lines.length;i++) {
			var tr = document.createElement("tr");

			var tlineNo = document.createElement("td");
			tlineNo.className = 'line-no'
			tlineNo.appendChild(document.createTextNode(i+1))
			tr.appendChild(tlineNo);

			var tlineText = document.createElement("td");
			tlineText.appendChild(document.createTextNode(lines[i]))
			tr.appendChild(tlineText);

			tbody.appendChild(tr);
		}
	});
});

tbody.addEventListener('click', ev => {
	var target = ev.target;
	var row = target.parentElement;
	if (row.tagName == 'TR') {
		var lineNo = row.querySelector(".line-no");
		lineNo.classList.toggle("breakpoint");
	}
});