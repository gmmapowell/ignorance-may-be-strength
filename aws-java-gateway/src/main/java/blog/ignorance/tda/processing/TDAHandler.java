package blog.ignorance.tda.processing;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;

import blog.ignorance.tda.interfaces.ServerLogger;

public class TDAHandler implements RequestHandler<ProcessorRequest, ProcessorResponse> {
	static TDACentralConfiguration central = new TDACentralConfiguration();
	
	public ProcessorResponse handleRequest(ProcessorRequest req, Context cx) {
		try {
			ServerLogger logger = new AWSLambdaLogger(cx.getLogger());
			ProcessorResponse r = new ProcessorResponse();
			req.handleIt(central, logger, r, cx);
			return r;
		} catch (Exception e) {
			// should log this to cx
			// should return a suitable response ...
			return null;
		}
	}
}
