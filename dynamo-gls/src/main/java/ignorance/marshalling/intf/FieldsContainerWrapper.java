package ignorance.marshalling.intf;

public interface FieldsContainerWrapper {

	@FunctionalInterface
	public interface FieldsTraverser {
		void field(String fld, Object value);
	}
	
	int size();
	boolean has(String fld);
	Object get(String fld);
	void set(String fld, Object value);
	void clear(String fld);
	void all(FieldsTraverser traverser);
	void allPlus(FieldsTraverser traverser);
	String id();
}
