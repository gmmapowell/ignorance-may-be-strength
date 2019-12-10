package blog.ignorance.tda.processing;

import java.io.PrintWriter;
import java.io.StringWriter;

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

	@Override
	public void log(String hint, Throwable err) {
		StringWriter sw = new StringWriter();
		PrintWriter pw = new PrintWriter(sw);
		err.printStackTrace(pw);
		pw.flush();
		logger.log(hint + ": " + sw.toString());
	}
}
