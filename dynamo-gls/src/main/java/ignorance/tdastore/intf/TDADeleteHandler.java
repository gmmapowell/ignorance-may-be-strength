package ignorance.tdastore.intf;

public interface TDADeleteHandler {
	void success();
	void error(Throwable ex);
}
