package blog.ignorance.apigateway;

import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

public class IgnorantRequest {
	private Map<String, String> values = new HashMap<>();
	private Map<String, String> headers = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);

	public void setQueryStringParameters(Map<String, String> values) {
		if (values != null)
			this.values = values;
	}
	
	public void setHeaders(Map<String, String> headers) {
		if (headers != null)
			this.headers.putAll(headers);
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
}
