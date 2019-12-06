package blog.ignorance.tda.interfaces;

/** Enhance a RequestProcessor by processing header values.
 * header is called for each header in the request
 * 
 * @author gareth
 *
 */
public interface ProvideHeaders {
	/** Set a value of a header
	 * 
	 * @param name the name of the header
	 * @param value the value of the header
	 */
	public void header(String name, String value);
}
