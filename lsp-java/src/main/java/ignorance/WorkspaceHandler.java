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

public class WorkspaceHandler {
	private final Parser parser;
	private ExtendedLanguageClient client;
	private final URI workspaceRoot;

	public WorkspaceHandler(Parser parser, ExtendedLanguageClient client, WorkspaceFolder ws) throws URISyntaxException {
		this.parser = parser;
		this.client = client;
		// this is clearly meant as a root path, but because it does not end in "/", will not act as one
		// so add the "/" before going any further ...
    	workspaceRoot = new URI(ws.getUri() + "/");
    	System.err.println("parsing files for " + workspaceRoot);
	}

	public void client(ExtendedLanguageClient client) {
		this.client = client;
		parseAllFiles();
	}

    private void parseAllFiles() {
    	File file = new File(workspaceRoot.getPath());
    	parseDir(file);
    	client.sendTokens("hello, world");
	}

	private void parseDir(File dir) {
		System.err.println("parsing files in directory " + dir.getName());
		for (File f : dir.listFiles()) {
    		try {
    			if (f.isDirectory())
    				parseDir(f);
    			else if (f.isFile() && (f.getName().endsWith(".fl") || f.getName().endsWith(".st"))) {
    				System.err.println("parsing file " + f.getName());
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
