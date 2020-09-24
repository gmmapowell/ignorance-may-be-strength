package ignorance;

import java.net.URI;

public class Line {

	public final URI uri;
	public final int line;
	public final int ind;
	public final boolean cont;
	public final String text;

	public static Line from(URI uri, int line, String s) {
		int ind = 0;
		boolean cont = false;
		for (int i=0;i<s.length();i++) {
			if (s.charAt(i) == '\t' && ind == i)
				ind++;
			else if (Character.isWhitespace(s.charAt(i)))
				cont = true;
			else
				return new Line(uri, line, ind, cont, s.substring(i));
		}
		return new Line(uri, line, 0, false, ""); // it's essentially blank
	}

	public Line(URI uri, int line, int ind, boolean cont, String text) {
		if (text == null)
			throw new RuntimeException("should not be null");
		this.uri = uri;
		this.line = line;
		this.ind = ind;
		this.cont = cont;
		this.text = text;
	}

	public boolean isKeyword(String kw) {
		return keyword().equals(kw);
	}

	public String keyword() {
		int sp = text.indexOf(' ');
		if (sp == -1)
			return text;
		else
			return text.substring(0, sp);
	}
}
