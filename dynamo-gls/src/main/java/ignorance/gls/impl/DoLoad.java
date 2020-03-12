package ignorance.gls.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ignorance.gls.intf.GLRelationAction;
import ignorance.tdastore.common.UOWExecutor;
import ignorance.tdastore.intf.TDAStorage;

public class DoLoad implements GLRelationAction {
	public final Logger logger = LoggerFactory.getLogger("DoGet");
	private final String slot;
	private final Object value;

	public DoLoad(GLSRelation r, String slot, Object value) {
		this.slot = slot;
		this.value = value;
	}

	public InvocationStatus invoke(TDAStorage storage, UOWExecutor exec, GLUnitOfWork uow, GLSRelation couchbaseRelation, SlotBindings bindings) {
		if (slot != null)
			bindings.bind(slot, value);
		else {
			// Almost undoubtedly, we won't look up the class name but the interface name
			// So load it into all possible (reasonable?) interfaces
			bindings.walk(value);
		}
		return InvocationStatus.COMPLETED;
	}
	
	@Override
	public String toString() {
		if (slot != null)
			return "DoLoad[" + slot + " <- " + value + "]";
		else
			return "DoWalk[" + value + "]";
	}
}
