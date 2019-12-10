package blog.ignorance.timer;

import java.util.Date;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;

import blog.ignorance.tda.example.TimerHandler;
import blog.ignorance.tda.interfaces.DesiresLogger;
import blog.ignorance.tda.interfaces.ProvideWSConnections;
import blog.ignorance.tda.interfaces.ServerLogger;
import blog.ignorance.tda.interfaces.TimerRequest;
import blog.ignorance.tda.interfaces.WithCouchbase;
import blog.ignorance.tda.processing.AWSLambdaLogger;
import blog.ignorance.tda.processing.TDACentralConfiguration;

public class OnTimer implements RequestHandler<TimerEvent, TimerResponse> {
	private static TDACentralConfiguration central = new TDACentralConfiguration();
	
	@Override
	public TimerResponse handleRequest(TimerEvent ev, Context cx) {
		cx.getLogger().log(new Date() + ": timer invoked by " + cx.getAwsRequestId());
		TimerRequest userHandler = new TimerHandler();
		ServerLogger logger = new AWSLambdaLogger(cx.getLogger());
		if (userHandler instanceof DesiresLogger) {
			((DesiresLogger)userHandler).provideLogger(logger);
		}
		if (userHandler instanceof ProvideWSConnections) {
			((ProvideWSConnections)userHandler).wsConnections(central.websocketSender(logger));
		}
		if (userHandler instanceof WithCouchbase) {
			central.applyCouchbase((WithCouchbase) userHandler);
		}
		userHandler.onTimer();
		return new TimerResponse();
	}
}
