package blog.ignorance.apigateway;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;

public class Handler implements RequestHandler<IgnorantRequest, IgnorantResponse> {
	public IgnorantResponse handleRequest(IgnorantRequest arg0, Context arg1) {
		if (arg0.hasQueryParameter("name"))
			return new IgnorantResponse(arg0.queryParameter("name"));
		else if (arg0.hasPathParameter("who"))
			return new IgnorantResponse(arg0.pathParameter("who"));
		else if (arg0.hasHeader("X-USER-NAME"))
			return new IgnorantResponse(arg0.getHeader("X-USER-NAME"));
		else if (arg0.hasBody())
			return new IgnorantResponse(arg0.getBody());
		else
			return new IgnorantResponse("world");
	}
}
