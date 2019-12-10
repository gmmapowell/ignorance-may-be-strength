package blog.ignorance.tda.processing;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.TreeMap;

import com.amazonaws.services.lambda.runtime.Context;

import blog.ignorance.tda.interfaces.BodyConsumer;
import blog.ignorance.tda.interfaces.DesiresLogger;
import blog.ignorance.tda.interfaces.ParameterSource;
import blog.ignorance.tda.interfaces.ProvideHeaders;
import blog.ignorance.tda.interfaces.ProvideParameters;
import blog.ignorance.tda.interfaces.ProvidePath;
import blog.ignorance.tda.interfaces.RequestProcessor;
import blog.ignorance.tda.interfaces.Responder;
import blog.ignorance.tda.interfaces.ServerLogger;
import blog.ignorance.tda.interfaces.WSProcessor;
import blog.ignorance.tda.interfaces.WSResponder;
import blog.ignorance.tda.interfaces.WithCouchbase;

public class ProcessorRequest {
	private String method = null;
	private String resource = null;
	private String path = null;
	private Map<String, List<String>> queryParams = new HashMap<>();
	private Map<String, String> headers = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);
	private Map<String, String> pathParams = new HashMap<>();
	private String body = null;
	private Map<String, Object> context;
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
	
	public void setRequestContext(Map<String, Object> context) {
		if (context != null)
			this.context = context;
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
	
	public void handleIt(TDACentralConfiguration central, ServerLogger logger, Responder response, Context cx) throws Exception {
		// This shouldn't happen, but if it does, I want no part of it
		if (context == null) {
			response.setStatus(500);
			response.write("No context provided");
			return;
		}
		logger.log("Context: " + context);
		if (context.containsKey("httpMethod")) {
			handleHTTPMethod(central, logger, response, cx);
		} else if (context.containsKey("routeKey")) {
			handleWSEvent(central, logger, response, cx);
		} else {
			response.setStatus(400);
			response.write("Cannot figure out the event type");
			return;
		}
	}

	private void handleHTTPMethod(TDACentralConfiguration central, ServerLogger logger, Responder response, Context cx)	throws IOException, Exception {
		RequestProcessor handler = central.createHandlerFor(method, resource);
		if (handler == null) {
			response.setStatus(404);
			response.write("There is no handler for " + path);
			return;
		}
		if (handler instanceof DesiresLogger) {
			((DesiresLogger)handler).provideLogger(logger);
		}
		if (handler instanceof WithCouchbase) {
			central.applyCouchbase((WithCouchbase)handler);
		}
		if (handler instanceof ProvidePath) {
			((ProvidePath)handler).path(this.path);
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

	private void handleWSEvent(TDACentralConfiguration central, ServerLogger logger, Responder response, Context cx) {
		WSProcessor wsproc = central.websocketHandler();
		if (wsproc instanceof DesiresLogger) {
			((DesiresLogger)wsproc).provideLogger(logger);
		}
		if (wsproc instanceof WithCouchbase) {
			central.applyCouchbase((WithCouchbase)wsproc);
		}
		WSResponder responder = central.responderFor(logger, (String) context.get("connectionId"), (String)context.get("domainName"), (String)context.get("stage"));
		if ("$connect".equals(context.get("routeKey"))) {
			wsproc.open(responder);
		} else if ("$default".equals(context.get("routeKey"))) {
			wsproc.onText(responder, body);
		} else	if ("$disconnect".equals(context.get("routeKey"))) {
			wsproc.close(responder);
		}
	}
}
