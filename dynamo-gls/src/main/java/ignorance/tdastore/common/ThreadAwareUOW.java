package ignorance.tdastore.common;

import ignorance.gls.intf.UnitOfWork;

public interface ThreadAwareUOW extends UnitOfWork {
	ThreadAwareTxManager getManager();
}
