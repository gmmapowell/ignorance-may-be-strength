package ignorance.marshalling.impl;

import java.util.HashMap;
import java.util.Map;

public class CollectingState implements CollectionState {
	private int next = 0;
	private final Map<Object, Object> map = new HashMap<>();

	@Override
	public boolean has(Object o) {
		return map.containsKey(o);
	}

	@Override
	public void circle(Object o, Object as) {
		map.put(o, as);
	}

	@Override
	public Object get(Object o) {
		if (!map.containsKey(o))
			throw new RuntimeException("There is no entry for " + o);
		return map.get(o);
	}

	@Override
	public Object nextName() {
		return "c"+(next++);
	}
}
