package ignorance.gls.impl;

import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.util.ArrayList;
import java.util.List;

import ignorance.exceptions.GLSException;
import ignorance.gls.annotations.GoingToBlock;
import ignorance.gls.annotations.Slot;
import ignorance.gls.intf.RelationHandler;

public class LogicAnalyzer {

	public static Logic analyzeMethod(RelationHandler handler, String method, boolean finalLogic) throws GLSException {
		Class<? extends RelationHandler> hc = handler.getClass();
		return analyzeMethod(hc, handler, method, finalLogic);
	}

	private static Logic analyzeMethod(Class<? extends RelationHandler> hc, RelationHandler handler, String method, boolean finalLogic) throws GLSException {
		List<Method> methods = new ArrayList<>();
		Method[] declaredMethods = hc.getDeclaredMethods();
		for (Method m : declaredMethods)
			if (m.getName().equals(method))
				methods.add(m);
		if (methods.size() == 0) {
			@SuppressWarnings("unchecked")
			Class<? extends RelationHandler> parent = (Class<? extends RelationHandler>) hc.getSuperclass();
			if (RelationHandler.class.isAssignableFrom(parent)) {
				return analyzeMethod(parent, handler, method, finalLogic);
			} else
				throw new GLSException("There is no declared method called " + method + " in the logic handler " + hc);
		}
		if (methods.size() > 1)
			throw new GLSException("There are multiple declared methods called " + method + " in the logic handler " + hc);
		List<String> args = new ArrayList<>();
		Method m = methods.get(0);
		for (Parameter a : m.getParameters()) {
			Slot slotAnn = a.getAnnotation(Slot.class);
			if (slotAnn == null) {
				args.add(a.getType().getName());
			} else
				args.add(slotAnn.value());
		}
		return new Logic(handler, m, args, finalLogic, m.getAnnotation(GoingToBlock.class));
	}

}
