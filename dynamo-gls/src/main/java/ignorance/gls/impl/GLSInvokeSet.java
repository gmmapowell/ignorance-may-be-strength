package ignorance.gls.impl;

import ignorance.gls.intf.RelationAction;
import ignorance.gls.intf.SetRelationAction;
import ignorance.gls.intf.UnitOfWork;
import ignorance.tdastore.common.InvokeSet;
import ignorance.tdastore.common.UOWExecutor;
import ignorance.tdastore.intf.TDAStorage;

public class GLSInvokeSet implements InvokeSet {
	private final GLSRelation r;
	private final SlotBindings bindings;
	private final SetRelationAction csra;

	public GLSInvokeSet(GLSRelation r, SlotBindings bindings, SetRelationAction csra) {
		this.r = r;
		this.bindings = bindings;
		this.csra = csra;
	}

	@Override
	public boolean updateLocalCreate(UnitOfWork uow) {
		return csra.updateLocalCreate((GLUnitOfWork) uow);
	}

	@Override
	public void invoke(TDAStorage storage, UOWExecutor exec, UnitOfWork uow) {
		csra.invoke(storage, exec, (GLUnitOfWork) uow, r, bindings);
	}

	public boolean is(RelationAction action) {
		return action == csra;
	}

	@Override
	public boolean forgetMe() {
		return csra.forgetMe();
	}

	@Override
	public String toString() {
		return "Invoke[" + csra + "]";
	}
}
