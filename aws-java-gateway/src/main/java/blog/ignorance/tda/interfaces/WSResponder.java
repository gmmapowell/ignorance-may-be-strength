package blog.ignorance.tda.interfaces;

/** A Websocket responder represents communicating
 * to the client of the WebSocket.
 * 
 * @author gareth
 */
public interface WSResponder {

	/** Send a text message back to the client
	 * 
	 * @param text the message to send
	 */
	void send(String text);

	/* Return a unique id that identifies the connection
	 */
	String connectionName();
	
	void close();
}
