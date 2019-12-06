package blog.ignorance.tda.processing;

import java.io.IOException;
import java.io.StringWriter;

import blog.ignorance.tda.interfaces.CookieSetter;
import blog.ignorance.tda.interfaces.Responder;

public class ProcessorResponse implements Responder {
	private int status = 200;
	private StringWriter body = new StringWriter();

	public ProcessorResponse() {
	}

	@Override
	public void setStatus(int stat) {
		this.status = stat;
	}

	public int getStatusCode() {
		return status;
	}
	
	@Override
	public void setHeader(String name, String value) {
		throw new RuntimeException("Not implemented");
	}

	@Override
	public CookieSetter setCookie(String name, String value) {
		throw new RuntimeException("Not implemented");
	}

	@Override
	public void clearCookie(String named) {
		throw new RuntimeException("Not implemented");
	}

	@Override
	public void setContentType(String contentType) {
		throw new RuntimeException("Not implemented");
	}

	@Override
	public void setContentLength(long length) {
		throw new RuntimeException("Not implemented");
	}

	@Override
	public void redirectTo(String location) throws IOException {
		throw new RuntimeException("Not implemented");
	}

	@Override
	public void write(String string) throws IOException {
		body.write(string);
	}

	public String getBody() {
		return body.toString();
	}
}
