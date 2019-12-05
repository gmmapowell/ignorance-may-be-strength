package blog.ignorance.apigateway;

import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

public class IgnorantRequest {
	private Map<String, String> values = new HashMap<>();
	private Map<String, String> headers = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);
	private Map<String, String> pathparams = new HashMap<>();
	private String body = null;

	public void setQueryStringParameters(Map<String, String> values) {
		if (values != null)
			this.values = values;
	}
	
	public void setHeaders(Map<String, String> headers) {
		if (headers != null)
			this.headers.putAll(headers);
	}
	
	public void setPathParameters(Map<String, String> params) {
		if (params != null)
			this.pathparams = params;
	}
	
	public void setBody(String body) {
		this.body = body;
	}
	
	public boolean hasQueryParameter(String p) {
		return values.containsKey(p);
	}
	
	public String queryParameter(String p) {
		return values.get(p);
	}
	
	public boolean hasHeader(String hdr) {
		return headers != null && headers.containsKey(hdr);
	}

	public String getHeader(String hdr) {
		return headers.get(hdr);
	}
	
	public boolean hasPathParameter(String p) {
		return pathparams.containsKey(p);
	}
	
	public String pathParameter(String p) {
		return pathparams.get(p);
	}
	
	public boolean hasBody() {
		return body != null && body.length() > 0;
	}
	
	public String getBody() {
		return body;
	}
}
