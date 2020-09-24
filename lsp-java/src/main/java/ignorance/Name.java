package ignorance;

import java.net.URI;

public class Name implements Comparable<Name> {
	private final URI uri;
	private final int line;
	private final int from, to;
	private final String name;

	public Name(URI uri, int line, int from, int to, String name) {
		this.uri = uri;
		this.line = line;
		this.from = from;
		this.to = to;
		this.name = name;
	}

	public boolean isUri(URI uri) {
		return uri.equals(this.uri);
	}
	
	public String name() {
		return name;
	}

	@Override
	public int compareTo(Name o) {
		int ret = name.compareTo(o.name);
		if (ret != 0)
			return ret;
		ret = uri.compareTo(o.uri);
		if (ret != 0)
			return ret;
		return Integer.valueOf(line).compareTo(o.line);
	}

	public URI uri() {
		return uri;
	}
}
