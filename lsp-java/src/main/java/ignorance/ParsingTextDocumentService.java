package ignorance;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.concurrent.CompletableFuture;

import org.eclipse.lsp4j.CompletionItem;
import org.eclipse.lsp4j.CompletionList;
import org.eclipse.lsp4j.CompletionParams;
import org.eclipse.lsp4j.DeclarationParams;
import org.eclipse.lsp4j.DidChangeTextDocumentParams;
import org.eclipse.lsp4j.DidCloseTextDocumentParams;
import org.eclipse.lsp4j.DidOpenTextDocumentParams;
import org.eclipse.lsp4j.DidSaveTextDocumentParams;
import org.eclipse.lsp4j.Location;
import org.eclipse.lsp4j.LocationLink;
import org.eclipse.lsp4j.MessageParams;
import org.eclipse.lsp4j.MessageType;
import org.eclipse.lsp4j.TextDocumentContentChangeEvent;
import org.eclipse.lsp4j.jsonrpc.messages.Either;
import org.eclipse.lsp4j.services.LanguageClient;
import org.eclipse.lsp4j.services.TextDocumentService;

class ParsingTextDocumentService implements TextDocumentService {
	private final Repository repository;
	private final Parser parser;
	private LanguageClient client;
	
    public ParsingTextDocumentService(Repository repository, Parser parser) {
		this.repository = repository;
		this.parser = parser;
	}

	public void setClient(LanguageClient client) {
		this.client = client;
	}

    @Override
    public void didOpen(DidOpenTextDocumentParams params) {
    	URI uri = parseURI(params.getTextDocument().getUri());
    	if (uri == null)
    		return;
			repository.clean(uri);
		parser.parse(uri, params.getTextDocument().getText());
    }

    @Override
    public void didChange(DidChangeTextDocumentParams params) {
    	URI uri = parseURI(params.getTextDocument().getUri());
    	if (uri == null)
    		return;
        for (TextDocumentContentChangeEvent changeEvent : params.getContentChanges()) {
            // Will be full update because we specified that is all we support
            if (changeEvent.getRange() != null) {
                throw new UnsupportedOperationException("Range should be null for full document update.");
            }
            if (changeEvent.getText() == null) {
                throw new UnsupportedOperationException("Text should not be null.");
            }

            parser.parse(uri, changeEvent.getText());
        }
    }

    @Override
    public CompletableFuture<Either<List<? extends Location>, List<? extends LocationLink>>> declaration(DeclarationParams params) {
    	String token = parser.tokenAt(parseURI(params.getTextDocument().getUri()), params.getPosition());
        List<Location> locs = repository.definitionsOf(token);
        return CompletableFuture.completedFuture(Either.forLeft(locs));
    }

    @Override
    public CompletableFuture<Either<List<CompletionItem>, CompletionList>> completion(CompletionParams params) {
    	String token = parser.tokenAt(parseURI(params.getTextDocument().getUri()), params.getPosition());
        List<CompletionItem> locs = repository.complete(token);
        return CompletableFuture.completedFuture(Either.forLeft(locs));
    }

    @Override
    public CompletableFuture<CompletionItem> resolveCompletionItem(CompletionItem unresolved) {
    	return CompletableFuture.completedFuture(unresolved);
    }
    
    @Override
    public void didClose(DidCloseTextDocumentParams params) {
    }

    @Override
    public void didSave(DidSaveTextDocumentParams params) {
    }

	private URI parseURI(String uris) {
    	try {
    		return new URI(uris);
    	} catch (URISyntaxException ex) {
            client.logMessage(new MessageParams(MessageType.Warning, "Problem parsing " + uris));
            return null;
    	}
	}
}
