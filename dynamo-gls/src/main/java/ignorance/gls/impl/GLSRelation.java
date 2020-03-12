package ignorance.gls.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Executor;
import java.util.function.Function;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ignorance.exceptions.GLSException;
import ignorance.gls.intf.GLRelationAction;
import ignorance.gls.intf.Relation;
import ignorance.gls.intf.RelationAction;
import ignorance.gls.intf.RelationHandler;
import ignorance.gls.intf.SetRelationAction;
import ignorance.gls.intf.TxError;
import ignorance.gls.intf.UnitOfWork;
import ignorance.tdastore.common.UOWExecutor;
import ignorance.tdastore.intf.TDAStorage;

public class GLSRelation implements Relation {
	public final Logger logger = LoggerFactory.getLogger("CouchRelation");
	private final UnitOfWork uow;
	private final RelationHandler handler;
	private final List<GLRelationAction> gls = new ArrayList<>();
	private final List<SetRelationAction> set = new ArrayList<>();
	private final FinalLogicSet endLogic;
	private RelationExecutor exec = null;

	public GLSRelation(UnitOfWork uow, RelationHandler handler) {
		this.uow = uow;
		this.handler = handler;
		endLogic = new FinalLogicSet(handler);
	}

	@Override
	public void whenCommitted(String method) throws GLSException {
		endLogic.whenCommitted(method);
	}

	@Override
	public void whenRolledBack(String method) throws GLSException {
		endLogic.whenRolledBack(method);
	}

	@Override
	public void atEnd(String method) throws GLSException {
		endLogic.atEnd(method);
	}

	public void performActions(UOWExecutor ue, GLUnitOfWork uow, TxError error, SlotBindings bindings) {
		endLogic.performActions(ue, uow, bindings, error);
	}

	public void addAction(RelationAction act) {
		if (exec != null)
			exec.add(act);
		else {
			if (act instanceof GLRelationAction)
				gls.add((GLRelationAction) act);
			else
				set.add((SetRelationAction) act);
		}
	}

	@Override
	public void get(String slot, String id) {
		addAction(new DoGet(slot, id, null));
	}
	
	@Override
	public void get(String slot, String id, Function<?,?> filter) {
		addAction(new DoGet(slot, id, filter));
	}

	@Override
	public void load(Object value) {
		addAction(new DoLoad(this, null, value));
	}

	@Override
	public void load(String slot, Object value) {
		addAction(new DoLoad(this, slot, value));
	}

	@Override
	public void logic(String method) throws GLSException {
		addAction(LogicAnalyzer.analyzeMethod(handler, method, false));
	}

	@Override
	public void logic(RelationHandler other, String method) throws GLSException {
		addAction(LogicAnalyzer.analyzeMethod(other, method, false));
	}

	@Override
	public void create(String id, Object value) {
		addAction(new DoCreate(uow, this, id, value, false));
	}

	@Override
	public void update(String id, Object obj) {
		addAction(new DoUpdate(id, obj));
	}

	@Override
	public void delete(String id) {
		addAction(new DoDelete(id));
	}

	public RelationExecutor makeReady(TDAStorage storage, Executor ex, UOWExecutor ue, UnitOfWork uow) {
		exec = new RelationExecutor(storage, ex, ue, uow, this, gls, set, endLogic);
		return exec;
	}
}
