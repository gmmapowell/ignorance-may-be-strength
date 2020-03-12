package ignorance.tdastore.intf;

public interface TDACreateHandler extends TDADeleteHandler {
	void alreadyExists();
}
