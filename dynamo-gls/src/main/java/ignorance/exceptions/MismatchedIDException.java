package ignorance.exceptions;

@SuppressWarnings("serial")
public class MismatchedIDException extends RuntimeException {

	public MismatchedIDException(String existing, String id) {
		super("assigning " + id + " to object which has " + existing);
	}

}
