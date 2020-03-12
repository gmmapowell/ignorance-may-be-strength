package ignorance.marshalling.impl;

public interface CollectionState {
	boolean has(Object o);
	void circle(Object o, Object as);
	Object get(Object o);
	Object nextName();
}
