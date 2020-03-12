package ignorance.gls.impl;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ignorance.exceptions.WrappedException;
import ignorance.gls.annotations.GoingToBlock;
import ignorance.gls.intf.GLRelationAction;
import ignorance.gls.intf.RelationHandler;
import ignorance.tdastore.common.UOWExecutor;
import ignorance.tdastore.intf.TDAStorage;

public class Logic implements GLRelationAction {
	public final Logger logger = LoggerFactory.getLogger("Logic");
	private final RelationHandler handler;
	private final Method method;
	private final List<String> args;
	private final boolean finalLogic;
	private final GoingToBlock willBlock;

	// args is a list of what logically needs to go there; either a slot name or a "special" class name
	public Logic(RelationHandler handler, Method method, List<String> args, boolean finalLogic, GoingToBlock willBlock) {
		this.handler = handler;
		this.method = method;
		this.args = args;
		this.finalLogic = finalLogic;
		this.willBlock = willBlock;
	}

	public InvocationStatus invoke(TDAStorage storage, UOWExecutor exec, GLUnitOfWork uow, GLSRelation couchbaseRelation, SlotBindings bindings) {
		if (!isReady(bindings))
			return InvocationStatus.IGNORED;
		Object[] ia = new Object[args.size()];
		for (int i=0;i<args.size();i++)
			ia[i] = bindings.bound(args.get(i));
		exec.execute(uow, willBlock != null, new Runnable() {

			@Override
			public void run() {
				try {
					Logic.this.method.invoke(handler, ia);
				} catch (IllegalArgumentException e) {
					if ("argument type mismatch".equals(e.getMessage())) {
						logger.error("argument type mismatching calling " + Logic.this.method + " with");
						for (int i=0;i<ia.length;i++) {
							logger.error(" #" + i + " = " + ia[i] + " {" + (ia[i] == null ? "null" : ia[i].getClass() + "}"));
						}
					}
					throw WrappedException.wrap(e);
				} catch (IllegalAccessException | InvocationTargetException e) {
					throw WrappedException.wrap(e);
				} finally {
					if (!finalLogic) {
						uow.opDone(Logic.this);
					}
				}
			}
			
			@Override
			public String toString() {
				return "Logic[" + method.getName() + "]";
			}
			
		});
		return InvocationStatus.FIRED;
	}

	private boolean isReady(SlotBindings bindings) {
		for (String s : args) {
			if (!bindings.has(s)) {
				return false;
			}
		}
		return true;
	}

	@Override
	public String toString() {
		return "Logic[" + method.getName() + "]";
	}
}
