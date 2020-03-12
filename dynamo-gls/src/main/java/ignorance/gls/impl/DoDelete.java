package ignorance.gls.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ignorance.gls.intf.SetRelationAction;
import ignorance.tdastore.common.UOWExecutor;
import ignorance.tdastore.intf.ExistingRecord;
import ignorance.tdastore.intf.TDADeleteHandler;
import ignorance.tdastore.intf.TDAStorage;

public class DoDelete implements SetRelationAction {
	public final Logger logger = LoggerFactory.getLogger("DoGet");
	private final String id;

	public DoDelete(String id) {
		this.id = id;
	}

	@Override
	public boolean updateLocalCreate(GLUnitOfWork uow) {
		if (uow.has(id)) {
			ExistingRecord er = uow.getCB(id);
			if (er instanceof LocallyCreatedRecord) {
				((LocallyCreatedRecord) er).willBeDeleted();
				return true;
			}
		}
		return false;
	}

	@Override
	public boolean forgetMe() {
		return false;
	}

	public void invoke(TDAStorage storage, UOWExecutor exec, GLUnitOfWork uow, GLSRelation couchbaseRelation, SlotBindings bindings) {
		storage.delete(uow, id, new TDADeleteHandler() {
			@Override
			public void success() {
				uow.opDone(DoDelete.this);
			}
			
			@Override
			public void error(Throwable ex) {
				uow.fatalError(ex);
				uow.opDone(DoDelete.this);
			}
		});
	}
}
