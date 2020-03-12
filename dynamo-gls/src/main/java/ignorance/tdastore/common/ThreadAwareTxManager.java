package ignorance.tdastore.common;

import java.util.List;

import ignorance.gls.intf.SetterRunner;
import ignorance.gls.intf.TxManager;
import ignorance.gls.intf.UnitOfWork;
import ignorance.tdastore.intf.TDAStorage;

public interface ThreadAwareTxManager extends TxManager {
	void currentThreadUOW(UnitOfWork uow);

	SetterRunner runSetActions(TDAStorage storage, UOWExecutor exec, UnitOfWork couchbaseUOW, List<InvokeSet> allSets);
}
