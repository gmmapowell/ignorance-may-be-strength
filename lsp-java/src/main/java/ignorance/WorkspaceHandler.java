package ignorance;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.StringWriter;
import java.net.URI;
import java.net.URISyntaxException;

import org.eclipse.lsp4j.MessageParams;
import org.eclipse.lsp4j.MessageType;
import org.eclipse.lsp4j.WorkspaceFolder;
import org.eclipse.lsp4j.services.LanguageClient;

public class WorkspaceHandler {
	private final Parser parser;
	private LanguageClient client;
	private final URI workspaceRoot;

	public WorkspaceHandler(Parser parser, LanguageClient client, WorkspaceFolder ws) throws URISyntaxException {
    		this.parser = parser;
			this.client = client;
			// this is clearly meant as a root path, but because it does not end in "/", will not act as one
    		// so add the "/" before going any further ...
        	workspaceRoot = new URI(ws.getUri() + "/");
        	parseAllFiles();
	}

	public void client(LanguageClient client) {
		this.client = client;
		parseAllFiles();
	}

    private void parseAllFiles() {
    	File file = new File(workspaceRoot.getPath());
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
