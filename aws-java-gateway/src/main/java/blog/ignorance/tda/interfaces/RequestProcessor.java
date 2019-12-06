package blog.ignorance.tda.interfaces;

/** Every class associated with the server must implement this
 * interface, along with any additional ones for gathering
 * information about the request.
 *  
 * @author gareth
 */
public interface RequestProcessor {
	/** Finish off request processing.  This method is only
	 * called after any other preparatory methods (defined in other
	 * interfaces) have been called.
	 * <p>
	 * The contract is that if the method can complete before
	 * returning (i.e. will not block and thus is synchronous), then
	 * the responder will be "done" as soon as this method returns.
	 * If the processor wishes to return before the response is complete,
	 * it needs to request more time by calling {@link Responder#setTimeout }
	 * method
	 * @param r an interface to be used as the responder
	 * @throws Exception  if errors occur; these will cause the connection to be closed
	 */
	public void process(Responder r) throws Exception;
}
