package ignorance.tdastore.common;

import java.util.Iterator;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

import ignorance.gls.intf.RelationAction;
import ignorance.gls.intf.SetterRunner;
import ignorance.gls.intf.UnitOfWork;
import ignorance.tdastore.intf.TDAStorage;

public abstract class TxManagerThreading implements ThreadAwareTxManager {
	private final ThreadLocal<UnitOfWork> thrlocal = new ThreadLocal<>();

	@Override
	public UnitOfWork currentUOW() {
		UnitOfWork ret = thrlocal.get();
		if (ret == null)
			throw new RuntimeException("This thread does not have a current unit of work");
		return ret;
	}

	@Override
	public void currentThreadUOW(UnitOfWork uow) {
		thrlocal.set(uow);
	}

	@Override
	public SetterRunner runSetActions(TDAStorage storage, UOWExecutor exec, UnitOfWork uow, List<InvokeSet> allSets) {
		if (allSets.isEmpty()) {
			uow.txdone();
			return null;
		}
		resolveLocalUpdates(uow, allSets);
		InvokeSet firstAction = allSets.get(0);
		firstAction.invoke(storage, exec, uow);
		return new SetterRunner() {
			AtomicBoolean doneFirst = new AtomicBoolean(false);
			public void waitForSets(RelationAction action) {
				synchronized (allSets) {
					for (InvokeSet cis : allSets) {
						if (cis.is(action)) {
							allSets.remove(cis);
							if (allSets.isEmpty())
								uow.txdone();
							else if (!doneFirst.getAndSet(true)) {
								for (InvokeSet csra : allSets) {
									csra.invoke(storage, exec, uow);
								}
							}
							return;
						}
					}
				}
				throw new RuntimeException("Do not have " + action);
			}
		};
	}

	private void resolveLocalUpdates(UnitOfWork uow, List<InvokeSet> allSets) {
		Iterator<InvokeSet> it = allSets.iterator();
		while (it.hasNext()) {
			InvokeSet is = it.next();
			if (is.updateLocalCreate(uow))
				it.remove();
		}
		
		// now remove any that realise it was a mistake
		it = allSets.iterator();
		while (it.hasNext()) {
			InvokeSet is = it.next();
			if (is.forgetMe())
				it.remove();
		}
	}
}
