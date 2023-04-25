package ignorance;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.ServerSocket;
import java.net.Socket;

import org.eclipse.lsp4j.jsonrpc.Launcher;
import org.eclipse.lsp4j.launch.LSPLauncher;
import org.eclipse.lsp4j.services.LanguageClient;

public class LSPServer {
    public static void main(String[] args) {
		if (args.length > 0) {
			// args[0] is a port
			int port = Integer.parseInt(args[0]);
			try (ServerSocket sock = new ServerSocket(port)) {
				while (true) {
					Socket accept = sock.accept();
					handle(accept.getInputStream(), accept.getOutputStream());
				}
			} catch (IOException ex) {
				ex.printStackTrace(System.out);
			}
		} else {
			handle(System.in, System.out);
		}
		
    }

	private static void handle(InputStream in, OutputStream out) {
		IgnorantLanguageServer server = new IgnorantLanguageServer();
        Launcher<LanguageClient> launcher = LSPLauncher.createServerLauncher(server, in, out);

        LanguageClient client = launcher.getRemoteProxy();
        server.connect(client);

        launcher.startListening();
	}
}
