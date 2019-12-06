package blog.ignorance.tda.interfaces;

import java.io.IOException;

public interface Responder {
	
	/** Set the response status.
	 * If no response status is set, 200 or 204 will be used.
	 * @param stat the explicit status to set
	 */
	public void setStatus(int stat);

	/** Specify a header
	 * 
	 * @param name the header to set
	 * @param value the header value
	 */
	public void setHeader(String name, String value);

	/** Set a cookie on the response
	 * 
	 * @param name the name of the cookie
	 * @param value the value of the cookie
	 * @return an object which can be used to set additional properties of the cookie
	 */
	public CookieSetter setCookie(String name, String value);

	/** Clear a cookie
	 * 
	 * @param named the name of the cookie to clear
	 */
	public void clearCookie(String named);

	/** Specify the response content type
	 * 
	 * @param contentType the type of the response
	 */
	public void setContentType(String contentType);

	/** Specify the content length of the response.
	 * If this is not called before the first call to {@link #write(char[], int, int)},
	 * then a value of -1 will be sent and the connection will be closed to signify the
	 * end of the transmission.
	 * 
	 * @param length the number of bytes to be sent in the response
	 */
	public void setContentLength(long length);

	/** Issue a redirect.  This must be done before status is set or any other
	 * write methods are called
	 * @param location where to redirect to
	 * @throws IOException 
	 */
	public void redirectTo(String location) throws IOException;

	/** Send part of the response.
	 * 
	 * @param string the text to write
	 * @throws IOException if errors occur writing to the stream; this will close the response
	 */
	public void write(String string) throws IOException;
}
