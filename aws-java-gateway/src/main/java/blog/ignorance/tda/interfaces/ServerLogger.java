package blog.ignorance.tda.interfaces;

public interface ServerLogger {

	void log(String string);
	void log(String hint, Throwable err);

}
