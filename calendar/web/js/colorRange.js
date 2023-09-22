function colorRange(range) {
	console.log(range);
	var from = new Date(Date.parse(range.from + "Z"));
	var to = new Date(Date.parse(range.to + "Z"));
	var color = range.color;
	var label = range.label;
	var curr = from;
	do {
		console.log(curr);
		var date = curr.getFullYear() + "-" + (curr.getMonth()+1).toString().padStart(2, '0') + "-" + curr.getDate().toString().padStart(2, '0');
		if (!colors[date]) {
			colors[date] = [];
		}
		colors[date].push({ color, label });
		curr.setDate(curr.getDate()+1);
	} while (curr <= to);
}