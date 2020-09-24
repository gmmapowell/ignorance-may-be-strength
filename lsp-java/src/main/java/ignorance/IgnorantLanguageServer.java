package ignorance;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.StringWriter;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.concurrent.CompletableFuture;

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
    private final Repository repo = new TokenRepository();
    private final Parser parser = new SimpleParser(repo, 100);
    private final ParsingTextDocumentService parsingService = new ParsingTextDocumentService(repo, parser);
    private URI workspaceRoot = null;
    private LanguageClient client = null;
    
    @Override
    public CompletableFuture<InitializeResult> initialize(InitializeParams params) {
        String root = params.getRootUri();
        if (root == null) {
        	workspaceRoot = null;
        } else {
        	try {
        		// this is clearly meant as a root path, but because it does not end in "/", will not act as one
        		// so add the "/" before going any further ...
	        	workspaceRoot = new URI(root + "/");
	        	parseAllFiles(new File(workspaceRoot.getPath()));
        	} catch (URISyntaxException ex) {
        		workspaceRoot = null;
        	}
        }

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
        this.parsingService.setClient(client);
        this.parser.setClient(client);
        this.repo.setClient(client);
    }

    private void parseAllFiles(File file) {
    	for (File f : file.listFiles()) {
    		try {
	    		if (f.getName().endsWith(".fl") || f.getName().endsWith(".st")) {
	    			parser.parse(workspaceRoot.resolve(f.getName()), readFile(f));
	                client.logMessage(new MessageParams(MessageType.Log, "Parsed " + f.getName() + " during initialization"));
	    		}
    		} catch (IOException ex) {
                client.logMessage(new MessageParams(MessageType.Warning, "Problem parsing " + f.getName()));
    		}
    	}
	}

	private String readFile(File f) throws IOException {
		try (BufferedReader br = new BufferedReader(new FileReader(f));
			 StringWriter sw = new StringWriter()) {
			char[] cbuf = new char[2000];
			int cnt;
			while ((cnt = br.read(cbuf)) != -1) {
				sw.write(cbuf, 0, cnt);
			}
			return sw.toString();
		}
	}
}
