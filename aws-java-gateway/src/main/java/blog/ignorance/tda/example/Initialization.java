package blog.ignorance.tda.example;

import blog.ignorance.tda.interfaces.Central;
import blog.ignorance.tda.interfaces.Initializer;
import blog.ignorance.tda.interfaces.RequestProcessor;
import blog.ignorance.tda.processing.Factory;

public class Initialization implements Initializer {

	@Override
	public void initialize(Central central) {
		Factory<? extends RequestProcessor> createHello = () -> new HelloRequest("world");
		central.allMethods("/hello", createHello);
		central.onGet("/hello/{who}", createHello);
	}

}
