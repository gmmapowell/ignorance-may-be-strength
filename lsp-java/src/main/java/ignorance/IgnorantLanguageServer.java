package ignorance;

import java.util.List;
import java.util.concurrent.CompletableFuture;

import org.eclipse.lsp4j.CompletionOptions;
import org.eclipse.lsp4j.DidChangeConfigurationParams;
import org.eclipse.lsp4j.DidChangeWatchedFilesParams;
import org.eclipse.lsp4j.InitializeParams;
import org.eclipse.lsp4j.InitializeResult;
import org.eclipse.lsp4j.MessageParams;
import org.eclipse.lsp4j.MessageType;
import org.eclipse.lsp4j.ServerCapabilities;
import org.eclipse.lsp4j.SymbolInformation;
import org.eclipse.lsp4j.TextDocumentSyncKind;
import org.eclipse.lsp4j.WorkspaceSymbolParams;
import org.eclipse.lsp4j.services.LanguageClient;
import org.eclipse.lsp4j.services.LanguageClientAware;
import org.eclipse.lsp4j.services.LanguageServer;
import org.eclipse.lsp4j.services.TextDocumentService;
import org.eclipse.lsp4j.services.WorkspaceService;

class IgnorantLanguageServer implements LanguageServer, LanguageClientAware {
    private LanguageClient client = null;
    private final SimpleParser parser = new SimpleParser(100);
    private ParsingTextDocumentService parsingService = new ParsingTextDocumentService(parser);

    @SuppressWarnings("unused")
    private String workspaceRoot = null;
    @Override
    public CompletableFuture<InitializeResult> initialize(InitializeParams params) {
        workspaceRoot = params.getRootPath();

        ServerCapabilities capabilities = new ServerCapabilities();
        capabilities.setTextDocumentSync(TextDocumentSyncKind.Full);

        return CompletableFuture.completedFuture(new InitializeResult(capabilities));
    }

    @Override
    public CompletableFuture<Object> shutdown() {
        return CompletableFuture.completedFuture(null);
    }

    @Override
    public void exit() {
    }


    @Override
    public TextDocumentService getTextDocumentService() {
        return parsingService;
    }

    @Override
    public WorkspaceService getWorkspaceService() {

        return new WorkspaceService() {
            @Override
            public CompletableFuture<List<? extends SymbolInformation>> symbol(WorkspaceSymbolParams params) {
                return null;
            }

            @Override
            public void didChangeConfiguration(DidChangeConfigurationParams params) {
//                Map<String, Object> settings = (Map<String, Object>) params.getSettings();
//                Map<String, Object> languageServerExample = (Map<String, Object>) settings.get("languageServerExample");
//                maxNumberOfProblems = ((Double)languageServerExample.getOrDefault("maxNumberOfProblems", 100.0)).intValue();
            }

            @Override
            public void didChangeWatchedFiles(DidChangeWatchedFilesParams params) {
                client.logMessage(new MessageParams(MessageType.Log, "We received an file change event"));
            }
        };
    }

    @Override
    public void connect(LanguageClient client) {
        this.client = client;
        this.parser.setClient(client);
    }
}
