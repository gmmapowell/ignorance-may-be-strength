package ignorance;

import java.net.URI;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;
import java.util.stream.Collectors;

import org.eclipse.lsp4j.CompletionItem;
import org.eclipse.lsp4j.Location;
import org.eclipse.lsp4j.services.LanguageClient;

public class TokenRepository implements Repository {
	private final Map<URI, String> files = new TreeMap<>();
	private final Set<Name> names = new TreeSet<>(); 
	@SuppressWarnings("unused")
	private LanguageClient client;

	@Override
	public void setClient(LanguageClient client) {
		this.client = client;
	}

	@Override
	public void rememberFile(URI uri, String text) {
		files.put(uri, text);
	}

	@Override
	public String getFile(URI uri) {
		return files.get(uri);
	}

	@Override
	public void clean(URI uri) {
		Iterator<Name> it = names.iterator();
		while (it.hasNext()) {
			Name nu = it.next();
			if (nu.isUri(uri))
				it.remove();
		}
	}

	@Override
	public void add(Name tok) {
		names.add(tok);
	}

	@Override
	public List<Location> definitionsOf(String token) {
		List<Location> ret = new ArrayList<>();
		for (Name n : names) {
			if (n.name().equals(token)) {
				ret.add(new Location(n.uri().toString(), n.range()));
			}
		}
		return ret;
	}

	@Override
	public List<CompletionItem> complete(String token) {
		List<CompletionItem> ret = new ArrayList<>();
		if (token == null)
			token = "";
		for (Name n : names) {
			if (n.name().startsWith(token)) {
				ret.add(new CompletionItem(n.name()));
			}
		}
		return ret;
	}

	@Override
	public Collection<String> info() {
		return names.stream().map(n -> n.name()).collect(Collectors.toList());
	}
}
