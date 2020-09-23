package ignorance;

public class Line {

	public final int ind;
	public final boolean cont;
	public final String text;

	public static Line from(String s) {
		int ind = 0;
		boolean cont = false;
		for (int i=0;i<s.length();i++) {
			if (s.charAt(i) == '\t' && ind == i)
				ind++;
			else if (Character.isWhitespace(s.charAt(i)))
				cont = true;
			else
				return new Line(ind, cont, s.substring(i));
		}
		return new Line(0, false, ""); // it's essentially blank
	}

	public Line(int ind, boolean cont, String text) {
		if (text == null)
			throw new RuntimeException("should not be null");
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
