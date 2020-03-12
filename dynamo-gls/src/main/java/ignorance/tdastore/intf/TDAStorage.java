package ignorance.tdastore.intf;

import ignorance.gls.intf.UnitOfWork;

public interface TDAStorage {
	void retrieve(UnitOfWork uow, String id, TDARetrieveHandler h);
	void create(UnitOfWork uow, String id, Object obj, TDACreateHandler h);
	<T> void update(UnitOfWork uow, String id, ExistingRecord cas, Object obj, TDAUpdateHandler h);
	void delete(UnitOfWork uow, String id, TDADeleteHandler h);
}
