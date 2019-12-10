package blog.ignorance.tda.interfaces;

/** The base interface for all Websocket Processors.
 * <p>
 * Classes implementing this interface are registered with the TDA architecture
 * and one instance of the class is instantiated for each incoming connection.
 * Using the DI framework, the class can receive any configuration it wants,
 * and in the "open" call it receives an object it can use to send messages
 * back to the other end of the connection.
 * <p>
 * It is also possible to implement most of the standard request processors
 * (such as parameters, but not content) to receive information about the request.
 * All of these are called <it>before</it> {@link #open()}; once they have all
 * been processed {@link open()} will be called.
 * <p>
 * It is guaranteed that {@link open()} will be called before any of the message
 * delivery {@link error()} or {@link close()} methods are called.
 * 
 * @author gareth
 */
public interface WSProcessor {
	
	/** The websocket initialization has finished and the socket is now open
	 * 
	 * @param responder the responder to the other end of the socket
	 */
	public void open(WSResponder responder);
	
	/** Handle a complete text message
	 * @param responder the responder to the other end of the socket
	 * @param text the incoming message
	 */
	public void onText(WSResponder responder, String text);
	
	/** Handle an error on the wire
	 * 
	 */
	public void error();
	
	/** The other end closed the socket
	 * @param responder 
	 * 
	 */
	public void close(WSResponder responder);
}
