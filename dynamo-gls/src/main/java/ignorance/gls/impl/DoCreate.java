package ignorance.gls.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ignorance.gls.intf.SetRelationAction;
import ignorance.gls.intf.UnitOfWork;
import ignorance.marshalling.intf.ProvideIDOnCreate;
import ignorance.tdastore.common.UOWExecutor;
import ignorance.tdastore.intf.TDACreateHandler;
import ignorance.tdastore.intf.TDAStorage;

public class DoCreate implements SetRelationAction {
	public final Logger logger = LoggerFactory.getLogger("DoGet");
	private final String id;
	private Object value;
	private final boolean allowRetry;
	private boolean dontBother;

	public DoCreate(UnitOfWork uow, GLSRelation r, String id, Object value, boolean allowRetry) {
		this.id = id;
		this.value = value;
		this.allowRetry = allowRetry;
		
		if (value instanceof ProvideIDOnCreate) {
			((ProvideIDOnCreate)value).provideID(id);
		}

		uow.remember(id, new LocallyCreatedRecord(this));
	}

	public void updateWithValue(Object value) {
		this.value = value;
	}

	public void willBeDeleted() {
		this.dontBother = true;
	}

	@Override
	public boolean forgetMe() {
		return dontBother;
	}
	@Override
	public boolean updateLocalCreate(GLUnitOfWork uow) {
		return false;
	}

	public void invoke(TDAStorage storage, UOWExecutor exec, GLUnitOfWork uow, GLSRelation couchbaseRelation, SlotBindings bindings) {
		storage.create(uow, id, value, new TDACreateHandler() {
			@Override
			public void success() {
				// nothing needs to be done here
				uow.opDone(DoCreate.this);
			}
			
			@Override
			public void error(Throwable ex) {
				uow.fatalError(ex);
				uow.opDone(DoCreate.this);
			}
			
			@Override
			public void alreadyExists() {
				if (allowRetry)
					uow.duplicateRetry();
				else
					uow.duplicateFailed();
				uow.opDone(DoCreate.this);
			}
		});
	}
	
	@Override
	public String toString() {
		return "Create[" + id + "]";
	}
}
