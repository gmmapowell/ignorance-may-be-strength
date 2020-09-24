package ignorance;

import java.net.URI;

import org.eclipse.lsp4j.services.LanguageClient;

public interface Parser {
	void setClient(LanguageClient client);
	void parse(URI uri, String text);
}
