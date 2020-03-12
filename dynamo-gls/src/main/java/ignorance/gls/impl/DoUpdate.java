package ignorance.gls.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ignorance.gls.intf.SetRelationAction;
import ignorance.tdastore.common.UOWExecutor;
import ignorance.tdastore.intf.ExistingRecord;
import ignorance.tdastore.intf.TDAStorage;
import ignorance.tdastore.intf.TDAUpdateHandler;

public class DoUpdate implements SetRelationAction {
	public final Logger logger = LoggerFactory.getLogger("DoGet");
	private final String id;
	private final Object value;

	public DoUpdate(String id, Object value) {
		this.id = id;
		this.value = value;
	}

	@Override
	public boolean updateLocalCreate(GLUnitOfWork uow) {
		if (!uow.has(id))
			return false;
		ExistingRecord er = uow.getCB(id);
		if (er instanceof LocallyCreatedRecord) {
			((LocallyCreatedRecord)er).updateWithValue(value);
			return true;
		} else
			return false;
	}

	@Override
	public boolean forgetMe() {
		return false;
	}

	public void invoke(TDAStorage storage, UOWExecutor exec, GLUnitOfWork uow, GLSRelation couchbaseRelation, SlotBindings bindings) {
		storage.update(uow, id, uow.getCB(id), value, new TDAUpdateHandler() {
			@Override
			public void updated() {
				uow.opDone(DoUpdate.this);
			}
			
			@Override
			public void sinceChanged() {
				uow.changedRetry();
				uow.opDone(DoUpdate.this);
			}
			
			@Override
			public void error(Throwable ex) {
				uow.fatalError(ex);
				uow.opDone(DoUpdate.this);
			}
		});
	}
	
	@Override
	public String toString() {
		return "DoUpdate[" + id + "]";
	}
}
