package ignorance;

import java.net.URI;
import java.util.Collection;
import java.util.List;

import org.eclipse.lsp4j.CompletionItem;
import org.eclipse.lsp4j.Location;
import org.eclipse.lsp4j.services.LanguageClient;

public interface Repository {
	void setClient(LanguageClient client);
	void rememberFile(URI uri, String text);
	String getFile(URI uri);
	void clean(URI uri);
	void add(Name tok);
	List<Location> definitionsOf(String token);
	List<CompletionItem> complete(String token);
	Collection<String> info();
}
