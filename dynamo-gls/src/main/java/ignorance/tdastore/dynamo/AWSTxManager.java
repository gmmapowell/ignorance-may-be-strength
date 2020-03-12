package ignorance.tdastore.dynamo;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

import ignorance.exceptions.WrappedException;
import ignorance.gls.intf.UnitOfWork;
import ignorance.tdastore.common.ThreadAwareTxManager;
import ignorance.tdastore.common.TxManagerThreading;
import ignorance.tdastore.common.UOWExecutor;
import ignorance.tdastore.intf.TDAStorage;

public class AWSTxManager extends TxManagerThreading implements ThreadAwareTxManager {
	private final TDAStorage storage;
	private final Executor exec;
	private final UOWExecutor uowexec;

	public AWSTxManager(TDAStorage storage, Executor exec, UOWExecutor uowexec) {
		this.storage = storage;
		this.exec = exec;
		this.uowexec = uowexec;
	}
	
	@Override
	public UnitOfWork newUnit() {
		CompletableFuture<Void> txCompleted = new CompletableFuture<Void>();

		try {
			UnitOfWork ret = new AWSUOW(this, storage, exec, uowexec, txCompleted);
			currentThreadUOW(ret);
			return ret;
		} catch (Exception ex) {
			throw WrappedException.wrap(ex);
		}
	}
}
