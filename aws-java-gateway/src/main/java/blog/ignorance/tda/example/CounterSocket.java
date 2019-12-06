package blog.ignorance.tda.example;

import blog.ignorance.tda.interfaces.DesiresLogger;
import blog.ignorance.tda.interfaces.ServerLogger;
import blog.ignorance.tda.interfaces.WSProcessor;
import blog.ignorance.tda.interfaces.WSResponder;

public class CounterSocket implements WSProcessor, DesiresLogger {
	private ServerLogger logger;

	@Override
	public void provideLogger(ServerLogger logger) {
		this.logger = logger;
	}

	@Override
	public void open(WSResponder responder) {
	}

	@Override
	public void onText(String text) {
		logger.log("have received " + text + "; would like to reply " + text.length());
	}

	@Override
	public void error() {
	}

	@Override
	public void close() {
	}
}
