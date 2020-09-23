package ignorance;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;

import org.eclipse.lsp4j.jsonrpc.Launcher;
import org.eclipse.lsp4j.launch.LSPLauncher;
import org.eclipse.lsp4j.services.LanguageClient;

public class LSPServer {
    public static void main(String[] args) {
        InputStream in = System.in; // socket.getInputStream();
        OutputStream out = System.out; // socket.getOutputStream();

        ExampleLanguageServer server = new ExampleLanguageServer();
        Launcher<LanguageClient> launcher = LSPLauncher.createServerLauncher(server, in, out);

        LanguageClient client = launcher.getRemoteProxy();
        server.connect(client);

        launcher.startListening();
    }
}
