package blog.ignorance.apigateway;

public class IgnorantResponse {
	private final String helloTo;

	public IgnorantResponse(String helloTo) {
		this.helloTo = helloTo;
	}

	public String getBody() {
		return "hello, " + helloTo;
	}
}
