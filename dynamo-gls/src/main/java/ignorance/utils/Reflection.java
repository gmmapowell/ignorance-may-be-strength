package ignorance.utils;

import java.lang.reflect.Constructor;
import java.util.ArrayList;
import java.util.List;

import ignorance.exceptions.WrappedException;

public class Reflection {
	public static <T> T create(Class<T> clz, Object... args) {
		try
		{
			Jimmy<T>[] constructors = wrap(clz.getDeclaredConstructors());
			return match(clz, "constructor", constructors, args).invoke(args);
		}
		catch (Exception ex)
		{
			throw WrappedException.wrap(ex);
		}
	}

	private static <O, T> Jimmy<T> match(Class<O> clz, String what, Jimmy<T>[] jimmies, Object[] args) {
		List<Jimmy<T>> matching = new ArrayList<Jimmy<T>>();
		loop:
		for (Jimmy<T> j : jimmies)
		{
			Class<?>[] jtypes = j.getTypes();
			if (args.length != jtypes.length)
				continue;
			for (int i=0;i<args.length;i++)
				if (args[i] != null && !jtypes[i].isInstance(args[i])) {
					if (jtypes[i].getSimpleName().equals("boolean") && args[i] instanceof Boolean)
						continue;
					else if (jtypes[i].getSimpleName().equals("int") && args[i] instanceof Integer)
						continue;
					else
						continue loop;
				}
			matching.add(j);
		}
		if (matching.isEmpty())
			throw new RuntimeException("There is no matching method '" + what + "' in class '" + clz.getName() + "' with " + showArgs(args));
		else if (matching.size() > 1)
			throw new RuntimeException("Ambiguous '" + what + "' in class '" + clz.getName() + "' with " + showArgs(args));
		else
			return matching.get(0);
	}

	private static String showArgs(Object[] args) {
		if (args == null || args.length == 0)
			return "no args";
		List<String> ret = new ArrayList<String>();
		for (Object o : args) {
			if (o == null)
				ret.add("null");
			else if (o instanceof String)
				ret.add("" + '"' + o + '"');
			else if (o instanceof String)
				ret.add("" + '"' + o + '"');
			else if (o instanceof Integer)
				ret.add(Integer.toString((int) o));
			else
				ret.add(o.getClass().getName());
		}
		return ret.toString();
	}

	public static interface Jimmy<T> {
		public abstract T invoke(Object[] args) throws Exception;

		public abstract Class<?>[] getTypes();
	}

	public static class CJimmy<T> implements Jimmy<T> {
		private final Constructor<T> constructor;

		public CJimmy(Constructor<T> constructor) {
			this.constructor = constructor;
		}

		@Override
		public Class<?>[] getTypes() {
			return constructor.getParameterTypes();
		}

		@Override
		public T invoke(Object[] args) throws Exception {
			constructor.setAccessible(true);
			return constructor.newInstance(args);
		}
	}

	
	@SuppressWarnings("unchecked")
	private static <T> Jimmy<T>[] wrap(Constructor<?>[] constructors) {
		Jimmy<T>[] ret = new CJimmy[constructors.length];
		for (int i = 0;i<constructors.length;i++)
			ret[i] = new CJimmy<T>((Constructor<T>)constructors[i]);
		return ret;
	}
}
