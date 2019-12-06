package blog.ignorance.tda.example;

import blog.ignorance.tda.interfaces.BodyConsumer;
import blog.ignorance.tda.interfaces.ParameterSource;
import blog.ignorance.tda.interfaces.ProvideHeaders;
import blog.ignorance.tda.interfaces.ProvideParameters;
import blog.ignorance.tda.interfaces.RequestProcessor;
import blog.ignorance.tda.interfaces.Responder;

public class HelloRequest implements RequestProcessor, ProvideParameters, ProvideHeaders, BodyConsumer {
	private String message;

	public HelloRequest(String defaultMessage) {
		this.message = defaultMessage;
	}
	
	@Override
	public void header(String name, String value) {
		if ("X-USER-NAME".equalsIgnoreCase(name))
			this.message = value;
	}

	@Override
	public void stringValue(String name, String value, ParameterSource source) {
		if (source == ParameterSource.PATH && "who".equals("name"))
			this.message = value;
		if (source == ParameterSource.QUERYPOST && "name".equals("name"))
			this.message = value;
	}

	@Override
	public void consumeBody(String body) {
		this.message = body;
	}

	@Override
	public void process(Responder r) throws Exception {
		r.write("hello, " + message);
	}
}
