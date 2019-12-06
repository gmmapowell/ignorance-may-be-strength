package blog.ignorance.wsclient;

import org.glassfish.grizzly.websockets.WebSocket;
import org.glassfish.grizzly.websockets.WebSocketAdapter;

public class LineCharacterCounter extends WebSocketAdapter {
	@Override
	public void onMessage(WebSocket ws, String message) {
		System.out.println(message);
	}
}
