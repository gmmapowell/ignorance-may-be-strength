package ignorance;

import java.net.URI;
import java.util.Collection;

import org.eclipse.lsp4j.services.LanguageClient;

public interface Repository {
	void setClient(LanguageClient client);
	void clean(URI uri);
	void add(Name tok);
	Collection<String> info();
}
