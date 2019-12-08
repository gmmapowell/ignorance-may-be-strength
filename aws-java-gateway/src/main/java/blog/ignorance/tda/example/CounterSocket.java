package blog.ignorance.tda.example;

import blog.ignorance.tda.interfaces.WSProcessor;
import blog.ignorance.tda.interfaces.WSResponder;

public class CounterSocket implements WSProcessor {
	@Override
	public void open(WSResponder responder) {
	}

	@Override
	public void onText(WSResponder responder, String text) {
		responder.send("Length: " + text.length());
	}

	@Override
	public void error() {
	}

	@Override
	public void close() {
	}
}
