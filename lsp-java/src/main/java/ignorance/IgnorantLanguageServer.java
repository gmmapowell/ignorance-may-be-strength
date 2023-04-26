package ignorance;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.CompletableFuture;

import org.eclipse.lsp4j.CompletionOptions;
import org.eclipse.lsp4j.DidChangeConfigurationParams;
import org.eclipse.lsp4j.DidChangeWatchedFilesParams;
import org.eclipse.lsp4j.ExecuteCommandOptions;
import org.eclipse.lsp4j.ExecuteCommandParams;
import org.eclipse.lsp4j.InitializeParams;
import org.eclipse.lsp4j.InitializeResult;
import org.eclipse.lsp4j.MessageParams;
import org.eclipse.lsp4j.MessageType;
import org.eclipse.lsp4j.ServerCapabilities;
import org.eclipse.lsp4j.TextDocumentSyncKind;
import org.eclipse.lsp4j.WorkspaceFolder;
import org.eclipse.lsp4j.services.LanguageClient;
import org.eclipse.lsp4j.services.LanguageClientAware;
import org.eclipse.lsp4j.services.LanguageServer;
import org.eclipse.lsp4j.services.TextDocumentService;
import org.eclipse.lsp4j.services.WorkspaceService;

import com.google.gson.JsonPrimitive;

class IgnorantLanguageServer implements LanguageServer, LanguageClientAware {
    private final Repository repo = new TokenRepository();
    private final Parser parser = new SimpleParser(repo, 100);
    private final ParsingTextDocumentService parsingService = new ParsingTextDocumentService(repo, parser);
    private LanguageClient client = null;
	private final List<WorkspaceHandler> handlers = new ArrayList<>();
	private boolean amReady = false;
    
    @Override
    public CompletableFuture<InitializeResult> initialize(InitializeParams params) {
    	for (WorkspaceFolder ws : params.getWorkspaceFolders()) {
    		try {
	    		WorkspaceHandler handler = new WorkspaceHandler(parser, client, ws);
	    		handlers.add(handler);
	    	} catch (URISyntaxException ex) {
	    	}
    	}

        ServerCapabilities capabilities = new ServerCapabilities();
        ExecuteCommandOptions requestTokens = new ExecuteCommandOptions(Arrays.asList("java.lsp.requestTokens"));
		capabilities.setExecuteCommandProvider(requestTokens);
        capabilities.setTextDocumentSync(TextDocumentSyncKind.Full);
        capabilities.setDeclarationProvider(true);
        capabilities.setCompletionProvider(new CompletionOptions(true, new ArrayList<>()));

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
        	public CompletableFuture<Object> executeCommand(ExecuteCommandParams params) {
        		switch (params.getCommand()) {
        		case "java.lsp.requestTokens": {
        			System.err.println("requestTokens command called for " + params.getArguments().get(0));
        			return repo.allTokensFor(URI.create(((JsonPrimitive) params.getArguments().get(0)).getAsString()));
        		}
        		case "ignorance/readyForTokens": {
        			System.err.println("readyForTokens");
        			amReady = true;
        			return CompletableFuture.completedFuture(null);
        		}
        		default: {
        			System.err.println("cannot handle command " + params.getCommand());
        			return CompletableFuture.completedFuture(null);
        		}
        		}
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
        this.parsingService.setClient(client);
        this.parser.setClient(client);
        this.repo.setClient(client);
        
        for (WorkspaceHandler h : handlers) {
        	h.client(client);
        }
    }
}
