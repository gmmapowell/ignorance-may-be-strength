package ignorance.tdastore.intf;

public interface TDAUpdateHandler {

	void updated();
	void sinceChanged();
	void error(Throwable ex);

}
