class CircleShape {
	render(ca, x, y, w, h) {
		ca.newpath();
		ca.ellipse(x, y, w, h);
		ca.stroke();
	}
}

export { CircleShape };