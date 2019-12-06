package blog.ignorance.tda.processing;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.TreeMap;

import com.amazonaws.services.lambda.runtime.Context;

import blog.ignorance.tda.interfaces.BodyConsumer;
import blog.ignorance.tda.interfaces.ParameterSource;
import blog.ignorance.tda.interfaces.ProvideHeaders;
import blog.ignorance.tda.interfaces.ProvideParameters;
import blog.ignorance.tda.interfaces.RequestProcessor;
import blog.ignorance.tda.interfaces.Responder;

public class ProcessorRequest {
	private String method = null;
	private String resource = null;
	private String path = null;
	private Map<String, List<String>> queryParams = new HashMap<>();
	private Map<String, String> headers = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);
	private Map<String, String> pathParams = new HashMap<>();
	private String body = null;
//	private String contentType;

	public void setHttpMethod(String method) {
		this.method = method;
	}
	
	public void setPath(String path) {
		this.path = path;
	}
	
	public void setResource(String resource) {
		this.resource = resource;
	}
	
	public void setMultiValueQueryStringParameters(Map<String, List<String>> values) {
		if (values != null)
			this.queryParams = values;
	}
	
	public void setHeaders(Map<String, String> headers) {
		if (headers != null) {
			this.headers.putAll(headers);
//			if (headers.containsKey("content-type"))
//				contentType = headers.get("content-type");
		}
	}
	
	public void setPathParameters(Map<String, String> params) {
		if (params != null)
			this.pathParams = params;
	}
	
	public void setBody(String body) {
		this.body = body;
	}
	
	public void handleIt(TDACentralConfiguration central, Responder response, Context cx) throws Exception {
		RequestProcessor handler = central.createHandlerFor(method, resource);
		if (handler == null) {
			response.setStatus(404);
			response.write("There is no handler for " + path);
			return;
		}
		if (handler instanceof ProvideHeaders) {
			ProvideHeaders consumer = (ProvideHeaders) handler;
			for (Entry<String, String> e : headers.entrySet())
				consumer.header(e.getKey(), e.getValue());
		}
		if (handler instanceof ProvideParameters) {
			ProvideParameters consumer = (ProvideParameters)handler;
			for (Entry<String, String> e : pathParams.entrySet())
				consumer.stringValue(e.getKey(), e.getValue(), ParameterSource.PATH);
			for (Entry<String, List<String>> e : queryParams.entrySet())
				for (String s : e.getValue())
					consumer.stringValue(e.getKey(), s, ParameterSource.QUERYPOST);
			// TODO: if contentType is "application/x-form-www-urlencoded", parse & pull parameters from the body as well 
		}
		if (body != null && body.length() > 0 && handler instanceof BodyConsumer 
				// TODO: when we pull the parameters from encoded bodies, we don't want to pass the body as well
				/* && !"application/x-form-www-urlencoded".equals(contentType) */) {
			((BodyConsumer)handler).consumeBody(body);
		}
		handler.process(response);
	}
}
