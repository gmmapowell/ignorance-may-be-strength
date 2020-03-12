package ignorance.exceptions;

import java.lang.reflect.InvocationTargetException;

@SuppressWarnings("serial")
public class WrappedException extends RuntimeException {

	public WrappedException(Throwable ex) {
		super("Wrapped Exception", ex);
	}

	public Exception unwrap() {
		Throwable ex2 = this.getCause();
		if (ex2 instanceof Exception) {
			if (ex2 instanceof InvocationTargetException /* or others of similar ilk */) {
				Throwable ex3 = ex2.getCause();
				if (ex3 instanceof Exception)
					return (Exception)ex3;
			}
			return (Exception)ex2;
		} else
			return this;
	}

	public static RuntimeException wrap(Throwable ex) {
		while (ex instanceof InvocationTargetException)
			ex = ex.getCause();
		if (ex instanceof RuntimeException)
			return (RuntimeException)ex;
		return new WrappedException(ex);
	}

}
