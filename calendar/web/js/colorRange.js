function colorRange(range) {
	// console.log(range);
	var from = new Date(Date.parse(range.from));
	var to = new Date(Date.parse(range.to));
	var color = range.color;
	var label = range.label;
	var curr = from;
	do {
		// console.log(curr);
		var date = curr.getUTCFullYear() + "-" + (curr.getUTCMonth()+1).toString().padStart(2, '0') + "-" + curr.getUTCDate().toString().padStart(2, '0');
		if (!colors[date]) {
			colors[date] = [];
		}
		colors[date].push({ color, label });
		curr.setUTCDate(curr.getUTCDate()+1);
	} while (curr <= to);
}