package blog.ignorance.tda.processing;

import com.amazonaws.services.lambda.runtime.LambdaLogger;

import blog.ignorance.tda.interfaces.ServerLogger;

public class AWSLambdaLogger implements ServerLogger {
	private final LambdaLogger logger;

	public AWSLambdaLogger(LambdaLogger logger) {
		this.logger = logger;
	}

	@Override
	public void log(String string) {
		logger.log(string);
	}
}
