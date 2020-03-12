package ignorance.exceptions;

@SuppressWarnings("serial")
public class NotImplementedException extends RuntimeException {
	public NotImplementedException() {
		super("Not Implemented");
	}

	public NotImplementedException(String expl) {
		super("Not Implemented: " + expl);
	}
}
