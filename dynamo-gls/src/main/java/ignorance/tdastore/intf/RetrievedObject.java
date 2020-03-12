package ignorance.tdastore.intf;

public interface RetrievedObject<T> extends ExistingRecord {
	T object();
	void update(T updated, TDAUpdateHandler h);
}
