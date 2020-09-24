package ignorance;

import java.io.File;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;

import org.eclipse.lsp4j.Diagnostic;
import org.eclipse.lsp4j.DiagnosticSeverity;
import org.eclipse.lsp4j.MessageParams;
import org.eclipse.lsp4j.MessageType;
import org.eclipse.lsp4j.Position;
import org.eclipse.lsp4j.PublishDiagnosticsParams;
import org.eclipse.lsp4j.Range;
import org.eclipse.lsp4j.services.LanguageClient;

public class SimpleParser implements Parser {
	private final Repository repository;
    private int maxNumberOfProblems;
	private LanguageClient client;

	public SimpleParser(Repository repository, int maxProbs) {
		this.repository = repository;
		this.maxNumberOfProblems = maxProbs;
	}

	@Override
	public void setClient(LanguageClient client) {
		this.client = client;
	}

	@Override
	public void parse(URI uri, String text) {
		try {
			File path = new File(uri.getPath());
	        List<Diagnostic> diagnostics = new ArrayList<>();
	        List<Line> lines = splitLines(uri, text);
	        int problems = 0;
	        for (int i = 0; i < lines.size() && problems < maxNumberOfProblems; i++) {
	            Line line = lines.get(i);
	            if (line.cont || line.ind != 1) // only check top level definitions
	            	continue;
	            if (line.isKeyword("card") || line.isKeyword("contract")) {
	            	Name tok = readToken(line);
	            	if (tok != null) {
	            		repository.add(tok);
	            	}
	            } else {
	            	// it's an error
	                problems++;
	                Diagnostic diagnostic = new Diagnostic();
	                diagnostic.setSeverity(DiagnosticSeverity.Error);
	                int start = line.ind;
	                diagnostic.setRange(new Range(new Position(i, start), new Position(i, start+line.keyword().length())));
	                diagnostic.setMessage("invalid keyword: " + line.keyword());
	                diagnostic.setSource(path.getName());
	                diagnostics.add(diagnostic);
	            }
	        }
	
            client.logMessage(new MessageParams(MessageType.Log, "Repo has " + repository.info()));
	        client.publishDiagnostics(new PublishDiagnosticsParams(uri.toString(), diagnostics));
		} catch (Throwable t) {
			throw new RuntimeException("it was an error", t);
		}
    }

	private List<Line> splitLines(URI uri, String text) {
        List<Line> ret = new ArrayList<>();
        int lineNo = 1;
		for (String s : text.split("\\r?\\n"))
			ret.add(Line.from(uri, lineNo++, s));
		return ret;
	}

	private Name readToken(Line line) {
		// This is obviously a careless hack
		int idx = line.text.indexOf(' ');
		if (idx == -1)
			return null; // there is no space after keyword, hence no other token
		while (idx < line.text.length() && Character.isWhitespace(line.text.charAt(idx)))
			idx++;
		if (idx == line.text.length())
			return null; // we reached the end of the line ... no token
		int idx2 = line.text.indexOf(' ', idx+1);
		if (idx2 == -1)
			idx2 = line.text.length(); // the token goes to the end of the line
		return new Name(line.uri, line.line, idx, idx2, line.text.substring(idx, idx2));
	}
}
