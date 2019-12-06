package blog.ignorance.tda.processing;

import java.util.ArrayList;
import java.util.List;

import blog.ignorance.tda.interfaces.Central;
import blog.ignorance.tda.interfaces.Initializer;
import blog.ignorance.tda.interfaces.RequestProcessor;
import blog.ignorance.tda.interfaces.WSProcessor;

public class TDACentralConfiguration implements Central {
	private final List<Mapping> paths = new ArrayList<Mapping>();
	private Factory<? extends WSProcessor> wsfactory;
	
	public TDACentralConfiguration() {
		String init = System.getenv("InitializationClass");
		if (init != null) {
			try {
				((Initializer)Class.forName(init).newInstance()).initialize(this);
			} catch (InstantiationException | IllegalAccessException | ClassNotFoundException e) {
				// I'm not sure how easy it is to report this exception because we don't have the context at this point
				// Probably we should record it and report it on lambda invocation
				e.printStackTrace();
			}
		}
	}

	@Override
	public void allMethods(String path, Factory<? extends RequestProcessor> factory) {
		paths.add(new Mapping(path, factory));
	}

	@Override
	public void onGet(String path, Factory<? extends RequestProcessor> factory) {
		paths.add(new Mapping(path, factory, "GET"));
	}
	
	@Override
	public void websocket(Factory<? extends WSProcessor> factory) {
		wsfactory = factory;
	}

	public WSProcessor websocketHandler() {
		return wsfactory.create();
	}
	
	public RequestProcessor createHandlerFor(String method, String path) {
		Factory<? extends RequestProcessor> creator = null;
		for (Mapping m : paths) {
			if (m.matches(method, path)) {
				creator = m.creator;
				break;
			}
		}
		if (creator == null)
			return null;
		return creator.create();
	}
}
