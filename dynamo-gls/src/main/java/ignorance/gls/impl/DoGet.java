package ignorance.gls.impl;

import java.util.function.Function;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ignorance.gls.intf.GLRelationAction;
import ignorance.tdastore.common.UOWExecutor;
import ignorance.tdastore.intf.RetrievedObject;
import ignorance.tdastore.intf.TDARetrieveHandler;
import ignorance.tdastore.intf.TDAStorage;

public class DoGet implements GLRelationAction {
	public final Logger logger = LoggerFactory.getLogger("DoGet");
	private final String id;
	private final String slot;
	private final Function<Object, Object> filter;

	@SuppressWarnings("unchecked")
	public DoGet(String slot, String id, Function<?,?> filter) {
		if (id == null)
			throw new NullPointerException("cannot retrieve " + slot + " with id null");
		this.slot = slot;
		this.id = id;
		this.filter = (Function<Object, Object>) filter;
	}

	public InvocationStatus invoke(TDAStorage storage, UOWExecutor exec, GLUnitOfWork uow, GLSRelation couchbaseRelation, SlotBindings bindings) {
		if (uow.has(id)) {
			@SuppressWarnings("unchecked")
			RetrievedObject<Object> fetched = (RetrievedObject<Object>) uow.getCB(id);
			// TODO: there may be a case where we have fired it but don't have the answer back yet
			Object retr = fetched.object();
			if (filter != null && retr != null)
				retr = filter.apply((Object)retr);
			bindings.bind(slot, retr);
			return InvocationStatus.COMPLETED;
		}
		storage.retrieve(uow, id, new TDARetrieveHandler() {
			@Override
			public void notfound() {
				logger.info("id " + id + " was not found");
				bindings.bind(slot, null);
				uow.opDone(DoGet.this);
			}
			
			@SuppressWarnings("unchecked")
			@Override
			public <T> void found(RetrievedObject<T> retrieved) {
				T retr = retrieved.object();
				uow.remember(id, retrieved);
				if (filter != null)
					retr = (T)filter.apply((Object)retr);
				bindings.bind(slot, retr);
				uow.opDone(DoGet.this);
			}
			
			@Override
			public void error(Throwable ex) {
				logger.info("Error retrieving " + id, ex);
				if (filter != null)
					filter.apply((Object)null);
				uow.fatalError(ex);
				uow.opDone(DoGet.this);
			}
		});
		return InvocationStatus.FIRED;
	}
	
	@Override
	public String toString() {
		return "Get[" + slot + "<-" + id + "]";
	}
}
