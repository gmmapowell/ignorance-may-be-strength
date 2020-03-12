package ignorance.gls.impl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Executor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicInteger;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ignorance.exceptions.GLSException;
import ignorance.gls.intf.GLRelationAction;
import ignorance.gls.intf.Relation;
import ignorance.gls.intf.RelationAction;
import ignorance.gls.intf.RelationHandler;
import ignorance.gls.intf.SetRelationAction;
import ignorance.gls.intf.SetterRunner;
import ignorance.gls.intf.TxError;
import ignorance.marshalling.intf.FieldsContainer;
import ignorance.model.JVMFieldsContainer;
import ignorance.tdastore.common.InvokeSet;
import ignorance.tdastore.common.ThreadAwareTxManager;
import ignorance.tdastore.common.ThreadAwareUOW;
import ignorance.tdastore.common.UOWExecutor;
import ignorance.tdastore.intf.ExistingRecord;
import ignorance.tdastore.intf.TDAStorage;

public abstract class GLUnitOfWork implements ThreadAwareUOW {
	public final Logger logger = LoggerFactory.getLogger(this.getClass());

	private final ThreadAwareTxManager txmgr;
	private final TDAStorage storage;
	protected final UOWExecutor uowexec;
	private final FinalLogicSet endLogic;
	private final Map<String, ExistingRecord> retrs = new TreeMap<>();
	private final List<GLSRelation> originals = new ArrayList<>();
	private boolean needRetry = false;
	private RelationFailedException fatalError;
	private boolean doneReads = false;
	private boolean hasCompleted = false;
	private boolean started = false;
	private Map<Relation, RelationExecutor> relexecs = new HashMap<>();
	private final List<InvokeSet> allSets = new ArrayList<>();
	private SetterRunner setterRunner;
	private final Executor exec;
	private CompletableFuture<Void> txCompleted;
	private AtomicInteger manualLock = new AtomicInteger();

	public GLUnitOfWork(ThreadAwareTxManager txmgr, TDAStorage storage, Executor exec, UOWExecutor uowexec, CompletableFuture<Void> txCompleted) {
		this.txmgr = txmgr;
		this.storage = storage;
		this.exec = exec;
		this.uowexec = uowexec;
		this.txCompleted = txCompleted;
		this.endLogic = new FinalLogicSet(null);
	}

	@Override
	public FieldsContainer newFieldsContainer() {
		return new JVMFieldsContainer();
	}

	@Override
	public ThreadAwareTxManager getManager() {
		return txmgr;
	}

	@Override
	public void whenCommitted(RelationHandler handler, String method) throws GLSException {
		endLogic.whenCommitted(handler, method);
	}

	@Override
	public void whenRolledBack(RelationHandler handler, String method) throws GLSException {
		endLogic.whenRolledBack(handler, method);
	}

	@Override
	public void atEnd(RelationHandler handler, String method) throws GLSException {
		endLogic.atEnd(handler, method);
	}

	@Override
	public synchronized Relation relation(TDAStorage storage, RelationHandler handler) {
		GLSRelation ret = new GLSRelation(this, handler);
		if (!started) {
			originals.add(ret);
		}
		return ret;
	}

	@Override
	public synchronized void makeReady(Relation r) {
		if (!started) {
			return;
		}
		GLSRelation cr = (GLSRelation) r;
		relexecs.put(cr, cr.makeReady(storage, exec, uowexec, this));
	}

	@Override
	public void enact() {
		starttx();
	}

	public synchronized void starttx() {
		started = true;
		relexecs.clear();
		for (GLSRelation r : originals)
			relexecs.put(r, r.makeReady(storage, exec, uowexec, this));
		playAll(null);
	}

	public void manualLock() {
		manualLock.getAndIncrement();
	}
	
	public void manualRelease() {
		if (manualLock.decrementAndGet() == 0)
			playAll(null);
	}
	
	synchronized void playAll(GLRelationAction action) {
		boolean allDone = manualLock.get() == 0;
		for (RelationExecutor re : relexecs.values()) {
			allDone &= re.playGL(action);
		}
		if (allDone && !doneReads)
			gldone();
	}

	public boolean has(String id) {
		return retrs.containsKey(id);
	}

	public <T> ExistingRecord getCB(String id) {
		ExistingRecord retr = retrs.get(id);
		if (retr == null)
			throw new NullPointerException("Doc " + id + " was apparently not retrieved");
		return retr;
	}

	@Override
	public <T> void remember(String id, ExistingRecord retr) {
		retrs.put(id, retr);
	}

	public void duplicateRetry() {
		needRetry = true;
	}

	public void changedRetry() {
		needRetry = true;
	}

	// TODO: improve this exception handling
	public void duplicateFailed() {
		if (fatalError == null)
			fatalError = new RelationFailedException();
		fatalError.add(new RuntimeException("duplicate"));
	}

	public void fatalError(Throwable ex) {
		if (fatalError == null)
			fatalError = new RelationFailedException();
		fatalError.add(ex);
	}
	
	public synchronized void gldone() {
		if (doneReads)
			throw new RuntimeException("You should not call setters in a UOW more than once");
		doneReads = true;
		allSets.clear();
		for (RelationExecutor exec : relexecs.values())
			exec.gather(allSets);
		setterRunner = txmgr.runSetActions(storage, uowexec, this, allSets);
	}
	
	public synchronized void txdone() {
		if (hasCompleted)
			throw new RuntimeException("You should not complete a UOW more than once");
		if (fatalError == null && needRetry) {
			// reset, then call starttx() again to let it rip ...
			reset();
			starttx();
			return;
		}
		if (fatalError != null) {
			for (RelationExecutor r : relexecs.values())
				r.performFinalActions(uowexec, this, fatalError);
			endLogic.performActions(uowexec, this, null, fatalError);
		} else {
			// TODO: I think this should probably all go through an executor
			for (RelationExecutor r : relexecs.values())
				r.performFinalActions(uowexec, this, null);
			endLogic.performActions(uowexec, this, null, null);
		}
		hasCompleted = true;
		if (txCompleted != null)
			txCompleted.complete(null);
	}

	private void reset() {
		fatalError = null;
		needRetry = false;
		doneReads = false;
	}

	public class UnblockHandler implements RelationHandler {
		private CompletableFuture<TxError> waitFor;

		public UnblockHandler(CompletableFuture<TxError> waitFor) {
			this.waitFor = waitFor;
		}

		public void unblock(TxError error) {
			this.waitFor.complete(error);
		}
	}
	
	protected void waitForEnd() throws GLSException  {
		CompletableFuture<TxError> waitFor = new CompletableFuture<>();
		try {
			atEnd(new UnblockHandler(waitFor), "unblock");
			strategyHelper();
			TxError err = waitFor.get(5, TimeUnit.SECONDS);
			if (err != null) {
				logger.error("block returned with error " + err);
				for (Throwable e : err)
					e.printStackTrace(System.out);
				throw new GLSException(err.toString());
			}
		} catch (GLSException ex) {
			logger.error("Failed to block", ex);
			throw ex;
		} catch (InterruptedException | ExecutionException | TimeoutException e) {
			logger.error("timed out", e);
			throw new GLSException("timed out");
		}
	}

	// This is here so that testing subclasses can make things happen at this point
	protected void strategyHelper() {
	}

	public synchronized void opDone(RelationAction ra) {
		if (ra instanceof GLRelationAction) {
			GLRelationAction action = (GLRelationAction) ra;
			playAll(action);
		} else {
			SetRelationAction action = (SetRelationAction) ra;
			setterRunner.waitForSets(action);
		}
	}

	@Override
	public synchronized Object read(Relation r, String slot) {
		RelationExecutor re = relexecs.get(r);
		return re.bound(slot);
	}

	public boolean hasCompleted() {
		return hasCompleted;
	}

	public boolean hasDoneGL() {
		return doneReads;
	}

	public boolean isLive() {
		return fatalError == null && !needRetry;
	}
}
