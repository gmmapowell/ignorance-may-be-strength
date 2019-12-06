package blog.ignorance.wsclient;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.LineNumberReader;
import java.util.concurrent.TimeUnit;

public class ClientMain {
	public static void main(String[] args) throws IOException {
		if (args.length != 1) {
			System.err.println("run with ws uri");
			System.exit(1);
		}
		String uri = args[0];
		LineCharacterCounter handler = new LineCharacterCounter();
		WSClient client = new WSClient(uri, handler);
		client.connect(5, TimeUnit.SECONDS);
		try (LineNumberReader r = new LineNumberReader(new InputStreamReader(System.in))) {
			while (true) {
				System.out.print("> ");
				String s = r.readLine();
				if (s == null)
					break;
				client.send(s);
			}
		}
	}
}
