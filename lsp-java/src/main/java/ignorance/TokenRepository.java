package ignorance;

import java.net.URI;
import java.util.Collection;
import java.util.Iterator;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;

import org.eclipse.lsp4j.services.LanguageClient;

public class TokenRepository implements Repository {
	private final Set<Name> names = new TreeSet<>(); 
	private LanguageClient client;

	@Override
	public void setClient(LanguageClient client) {
		this.client = client;
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
	public Collection<String> info() {
		return names.stream().map(n -> n.name()).collect(Collectors.toList());
	}
}
