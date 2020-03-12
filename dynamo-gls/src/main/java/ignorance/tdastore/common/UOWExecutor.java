package ignorance.tdastore.common;

import java.util.concurrent.Executor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class UOWExecutor {
	private static final Logger logger = LoggerFactory.getLogger("UOWExec");
	private final Executor underlying;
	private final Executor blocking;

	public UOWExecutor(Executor underlying, Executor blocking) {
		this.underlying = underlying;
		this.blocking = blocking;
	}

	public void execute(ThreadAwareUOW uow, boolean willBlock, Runnable runnable) {
		Runnable command = () -> {
			try {
				uow.getManager().currentThreadUOW(uow);
				runnable.run();
			} catch (Throwable t) {
				logger.error("Error processing command in UOW", t);
			} finally {
				uow.getManager().currentThreadUOW(null);
			}
		};
		if (willBlock) {
			blocking.execute(command);
		} else {
			underlying.execute(command);
		}
	}
}
