package ignorance.tdastore.common;

import ignorance.gls.intf.RelationAction;
import ignorance.gls.intf.UnitOfWork;
import ignorance.tdastore.intf.TDAStorage;

public interface InvokeSet {
	void invoke(TDAStorage storage, UOWExecutor exec, UnitOfWork uow);

	boolean is(RelationAction action);

	boolean updateLocalCreate(UnitOfWork uow);

	boolean forgetMe();
}
