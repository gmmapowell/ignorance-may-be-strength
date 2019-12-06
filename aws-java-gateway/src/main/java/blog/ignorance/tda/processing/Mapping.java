package blog.ignorance.tda.processing;

import java.util.Arrays;
import java.util.List;

import blog.ignorance.tda.interfaces.RequestProcessor;

public class Mapping {
	private String path;
	final Factory<? extends RequestProcessor> creator;
	private final List<String> methods;

	public Mapping(String path, Factory<? extends RequestProcessor> creator, String... methods) {
		this.path = path;
		this.creator = creator;
		this.methods = Arrays.asList(methods);
	}

	public boolean matches(String method, String path) {
		return (methods.isEmpty() || methods.contains(method))
			&& this.path.equalsIgnoreCase(path);
	}
}
