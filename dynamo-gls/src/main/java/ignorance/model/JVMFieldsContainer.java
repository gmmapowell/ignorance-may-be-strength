package ignorance.model;

import java.util.Map;
import java.util.Map.Entry;

import ignorance.marshalling.intf.FieldsContainer;
import ignorance.marshalling.intf.FieldsContainerWrapper.FieldsTraverser;

import java.util.TreeMap;

public class JVMFieldsContainer implements FieldsContainer {
	// this is a massive hack ... but might almost be good enough for mocks
	private Map<String, Object> fields = new TreeMap<>();
	
	@Override
	public int size() {
		return fields.size();
	}

	@Override
	public void set(String fld, Object value) {
		if (fld == null)
			throw new RuntimeException("field cannot be null");
		if (value == null)
			throw new RuntimeException("if you want to remove a value, implement and use remove, don't set to null");
		fields.put(fld, value);
	}

	@Override
	public boolean has(String fld) {
		return fields.containsKey(fld);
	}

	@Override
	public Object get(String fld) {
		return fields.get(fld);
	}

	@Override
	public void clear(String fld) {
		fields.remove(fld);
	}

	@Override
	public void all(FieldsTraverser traverser) {
		for (Entry<String, Object> e : fields.entrySet()) {
			if (e.getKey().startsWith("_"))
				continue;
			traverser.field(e.getKey(), e.getValue());
		}
	}

	@Override
	public void allPlus(FieldsTraverser traverser) {
		for (Entry<String, Object> e : fields.entrySet()) {
			traverser.field(e.getKey(), e.getValue());
		}
	}

	@Override
	public String toString() {
		return "Fields[" + fields.size() + ']';
	}
}
