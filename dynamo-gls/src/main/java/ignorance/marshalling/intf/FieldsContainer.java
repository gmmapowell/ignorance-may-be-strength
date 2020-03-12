package ignorance.marshalling.intf;

import ignorance.marshalling.intf.FieldsContainerWrapper.FieldsTraverser;

public interface FieldsContainer {
	public boolean has(String fld);
	public Object get(String fld);
	public void set(String fld, Object value);
	public void clear(String fld);
	public void all(FieldsTraverser traverser);
	public void allPlus(FieldsTraverser traverser);
	public int size();
}
