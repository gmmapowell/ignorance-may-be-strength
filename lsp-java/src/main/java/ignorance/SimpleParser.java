package ignorance;

import java.io.File;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;

import org.eclipse.lsp4j.Diagnostic;
import org.eclipse.lsp4j.DiagnosticSeverity;
import org.eclipse.lsp4j.Position;
import org.eclipse.lsp4j.PublishDiagnosticsParams;
import org.eclipse.lsp4j.Range;
import org.eclipse.lsp4j.services.LanguageClient;

public class SimpleParser {
    private int maxNumberOfProblems;
	private LanguageClient client;

	public SimpleParser(int maxProbs) {
		this.maxNumberOfProblems = maxProbs;
	}

	public void setClient(LanguageClient client) {
		this.client = client;
	}

	public void parse(String uris, String text) {
		try {
			URI uri = new URI(uris);
			File path = new File(uri.getPath());
	        List<Diagnostic> diagnostics = new ArrayList<>();
	        List<Line> lines = splitLines(text);
	        int problems = 0;
	        for (int i = 0; i < lines.size() && problems < maxNumberOfProblems; i++) {
	            Line line = lines.get(i);
	            if (line.cont || line.ind != 1) // only check top level definitions
	            	continue;
	            if (line.isKeyword("card") || line.isKeyword("contract")) {
	            	; // ultimately do something
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
	
	        client.publishDiagnostics(new PublishDiagnosticsParams(uris, diagnostics));
		} catch (Throwable t) {
			throw new RuntimeException("it was an error", t);
		}
    }

	private List<Line> splitLines(String text) {
        List<Line> ret = new ArrayList<>();
		for (String s : text.split("\\r?\\n"))
			ret.add(Line.from(s));
		return ret;
	}
}
