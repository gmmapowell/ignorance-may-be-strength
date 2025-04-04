chrome.runtime.onMessage.addListener(function(request, sender, respondTo) {
	switch (request.action) {
	case "scan-dom": {
		var response = [];
		var rows = document.querySelectorAll(".row");
		for (var rowNum=0;rowNum < rows.length; rowNum++) {
			var cols = rows[rowNum].querySelectorAll(".cell");
			var rowInfo = [];
			for (var colNum=0;colNum<cols.length;colNum++) {
				var cell = cols[colNum];
				var text = cell.innerText;
				var styles = [];
				for (var c of cell.classList) {
					if (c != "cell")
						styles.push(c);
				}
				rowInfo.push({ colNum, text, styles });
			}
			response.push({ rowNum, rowInfo });
		}
		respondTo(response);
		break;
	}
	}
});