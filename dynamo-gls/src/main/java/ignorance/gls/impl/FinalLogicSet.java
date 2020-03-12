package ignorance.gls.impl;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ignorance.exceptions.GLSException;
import ignorance.gls.intf.RelationHandler;
import ignorance.gls.intf.TxError;
import ignorance.tdastore.common.UOWExecutor;

public class FinalLogicSet {
	public final Logger logger = LoggerFactory.getLogger("GLS");
	private final RelationHandler commonHandler;
	private final List<Logic> committedLogics = new ArrayList<>();
	private final List<Logic> rollbackLogics = new ArrayList<>();

	public FinalLogicSet(RelationHandler handler) {
		this.commonHandler = handler;
	}

	public void whenCommitted(String method) throws GLSException {
		whenCommitted(commonHandler, method);
	}

	public void whenRolledBack(String method) throws GLSException {
		whenRolledBack(commonHandler, method);
	}

	public void atEnd(String method) throws GLSException {
		atEnd(commonHandler, method);
	}
	
	public void whenCommitted(RelationHandler handler, String method) throws GLSException {
		Logic l = LogicAnalyzer.analyzeMethod(handler, method, true);
		committedLogics.add(l);
	}

	public void whenRolledBack(RelationHandler handler, String method) throws GLSException {
		Logic l = LogicAnalyzer.analyzeMethod(handler, method, true);
		rollbackLogics.add(l);
	}

	public void atEnd(RelationHandler handler, String method) throws GLSException {
		Logic l = LogicAnalyzer.analyzeMethod(handler, method, true);
		committedLogics.add(l);
		rollbackLogics.add(l);
	}
	
	public void performActions(UOWExecutor exec, GLUnitOfWork uow, SlotBindings bindings, TxError error) {
		// TODO: mark relation "done" and then ensure no further requests are made on it
		if (bindings == null)
			bindings = new SlotBindings(null, uow);
		bindings.bind(TxError.class.getName(), error);
		if (error == null) {
			for (Logic l : committedLogics)
				l.invoke(null, exec, uow, null, bindings);
		} else {
			for (Logic l : rollbackLogics)
				l.invoke(null, exec, uow, null, bindings);
		}
	}
}
