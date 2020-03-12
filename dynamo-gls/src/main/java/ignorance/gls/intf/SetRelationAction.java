package ignorance.gls.intf;

import ignorance.gls.impl.GLSRelation;
import ignorance.gls.impl.GLUnitOfWork;
import ignorance.gls.impl.SlotBindings;
import ignorance.tdastore.common.UOWExecutor;
import ignorance.tdastore.intf.TDAStorage;

public interface SetRelationAction extends RelationAction {
	void invoke(TDAStorage storage, UOWExecutor exec, GLUnitOfWork uow, GLSRelation couchbaseRelation, SlotBindings bindings);

	boolean updateLocalCreate(GLUnitOfWork uow);
	boolean forgetMe();
}
