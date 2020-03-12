package ignorance.tdastore.dynamo;

import ignorance.gls.impl.GLUnitOfWork;
import ignorance.tdastore.intf.RetrievedObject;
import ignorance.tdastore.intf.TDAUpdateHandler;

public class DynamoRetrievedObject<T> implements RetrievedObject<T>, VersionHolder {
	private final GLUnitOfWork uow;
	private final AWSTxStorage storage;
	private final String id;
	private final T obj;
	private final long version;

	public DynamoRetrievedObject(GLUnitOfWork uow, AWSTxStorage storage, String id, T obj, long version) {
		this.uow = uow;
		this.storage = storage;
		this.id = id;
		this.obj = obj;
		this.version = version;
	}

	@Override
	public T object() {
		return obj;
	}

	@Override
	public void update(T updated, TDAUpdateHandler h) {
		storage.update(uow, id, this, updated, h);
	}

	@Override
	public long getVersion() {
		return version;
	}

}
