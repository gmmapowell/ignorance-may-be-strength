package ignorance;

import org.eclipse.lsp4j.jsonrpc.services.JsonNotification;
import org.eclipse.lsp4j.services.LanguageClient;

public interface ExtendedLanguageClient extends LanguageClient {
	@JsonNotification("ignorance/tokens")
	void sendTokens(Object object);

}
