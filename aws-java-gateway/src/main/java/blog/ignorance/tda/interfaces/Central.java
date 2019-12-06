package blog.ignorance.tda.interfaces;

import blog.ignorance.tda.processing.Factory;

public interface Central {
	void allMethods(String path, Factory<? extends RequestProcessor> factory);
	void onGet(String path, Factory<? extends RequestProcessor> factory);
	void websocket(Factory<? extends WSProcessor> factory);
}
