package ignorance.tdastore.dynamo;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

import ignorance.exceptions.GLSException;
import ignorance.gls.impl.GLUnitOfWork;
import ignorance.tdastore.common.ThreadAwareTxManager;
import ignorance.tdastore.common.UOWExecutor;
import ignorance.tdastore.intf.TDAStorage;

public class AWSUOW extends GLUnitOfWork {
	public AWSUOW(ThreadAwareTxManager txmgr, TDAStorage storage, Executor exec, UOWExecutor uowexec, CompletableFuture<Void> txCompleted) {
		super(txmgr, storage, exec, uowexec, txCompleted);
	}

	@Override
	public void waitForResult() throws GLSException {
		if (!hasCompleted())
			this.waitForEnd();		
	}
}
