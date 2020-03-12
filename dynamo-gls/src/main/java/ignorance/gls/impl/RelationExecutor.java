package ignorance.gls.impl;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.concurrent.Executor;

import ignorance.gls.intf.GLRelationAction;
import ignorance.gls.intf.RelationAction;
import ignorance.gls.intf.SetRelationAction;
import ignorance.gls.intf.UnitOfWork;
import ignorance.tdastore.common.InvokeSet;
import ignorance.tdastore.common.UOWExecutor;
import ignorance.tdastore.intf.TDAStorage;

public class RelationExecutor {
	private final TDAStorage storage;
	private final Executor exec;
	private final UOWExecutor uowexec;
	private final GLUnitOfWork uow;
	private final GLSRelation r;
	private final List<GLRelationAction> gla;
	private final List<SetRelationAction> set;
	private final FinalLogicSet finalLogic;
	private final SlotBindings bindings;
	private final Set<GLRelationAction> fired = new HashSet<>();

	public RelationExecutor(TDAStorage storage, Executor exec, UOWExecutor uowexec, UnitOfWork uow, GLSRelation r, List<GLRelationAction> glactions, List<SetRelationAction> setactions, FinalLogicSet finalLogic) {
		this.storage = storage;
		this.exec = exec;
		this.uowexec = uowexec;
		this.uow = (GLUnitOfWork) uow;
		this.r = r;
		this.bindings = new SlotBindings(storage, uow);
		this.bindings.walk(r);
		this.gla = new ArrayList<>(glactions);
		this.set = new ArrayList<>(setactions);
		this.finalLogic = finalLogic;
	}
	
	public synchronized boolean playGL(RelationAction toRemove) {
		boolean allDone = true;
		boolean somethingHappened = true;
		while (somethingHappened) {
			somethingHappened = false;
			Iterator<GLRelationAction> it = gla.iterator();
			while (it.hasNext()) {
				GLRelationAction act = it.next();
				if (act == toRemove) {
					it.remove();
				} else if (uow.isLive()) {
					allDone = false;
					if (!fired.contains(act)) {
						InvocationStatus stat = act.invoke(storage, uowexec, uow, null, bindings);
						if (stat == InvocationStatus.COMPLETED) {
							it.remove();
							somethingHappened = true;
						} else if (stat == InvocationStatus.FIRED) {
							fired.add(act);
							somethingHappened = true;
						}
					}
				}
			}
		}
		return allDone;
	}

	public void performFinalActions(UOWExecutor exec, GLUnitOfWork uow, RelationFailedException fatalError) {
		finalLogic.performActions(exec, uow, bindings, fatalError);
	}

	public synchronized void add(RelationAction act) {
		if (uow.hasDoneGL())
			throw new RuntimeException("Cannot add to relations once the UOW has completed");
		if (act instanceof GLRelationAction)
			gla.add((GLRelationAction) act);
		else
			set.add((SetRelationAction) act);
		needPlay();
	}

	private void needPlay() {
		exec.execute(() -> uow.playAll(null));
	}

	public Object bound(String slot) {
		if (!bindings.has(slot))
			throw new RuntimeException("There is no entry for " + slot + " in " + bindings);
		return bindings.bound(slot);
	}

	@Override
	public String toString() {
		try {
			return "RelationExecutor" + this.gla;
		} catch (Exception ex) {
			return "RelationExecutor[??]";
		}
	}

	public void gather(List<InvokeSet> allSets) {
		for (SetRelationAction i : set) {
			allSets.add(new GLSInvokeSet(r, bindings, i));
		}
	}
}
