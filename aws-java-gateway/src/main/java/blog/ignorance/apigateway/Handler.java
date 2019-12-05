package blog.ignorance.apigateway;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;

public class Handler implements RequestHandler<IgnorantRequest, IgnorantResponse> {
	@Override
	public IgnorantResponse handleRequest(IgnorantRequest arg0, Context arg1) {
		return new IgnorantResponse();
	}
}
