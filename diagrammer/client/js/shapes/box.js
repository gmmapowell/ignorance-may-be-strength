class BoxShape {
	render(ca, x, y, w, h) {
		ca.newpath();
		ca.move(x,y);
		ca.line(x+w,y);
		ca.line(x+w, y+h);
		ca.line(x, y+h);
		ca.close();
		ca.stroke();
	}
}

export default BoxShape;