package ignorance.model;

import ignorance.exceptions.MismatchedIDException;
import ignorance.gls.intf.UnitOfWork;
import ignorance.marshalling.intf.FieldsContainer;
import ignorance.marshalling.intf.FieldsContainerWrapper;
import ignorance.marshalling.intf.ProvideIDOnCreate;

public abstract class JVMFieldsContainerWrapper implements FieldsContainerWrapper, ProvideIDOnCreate {
	protected final FieldsContainer state;

	public JVMFieldsContainerWrapper(UnitOfWork cx) {
		state = cx.newFieldsContainer();
	}

	public JVMFieldsContainerWrapper(UnitOfWork cx, String type) {
		state = cx.newFieldsContainer();
		state.set("_type", type);
	}

	public JVMFieldsContainerWrapper(UnitOfWork cx, String type, String id) {
		state = cx.newFieldsContainer();
		state.set("_type", type);
		state.set("_id", id);
	}

	
	@Override
	public void provideID(String id) {
		if (state.has("_id")) {
			String existing = (String) state.get("_id");
			if (!existing.equals(id))
				throw new MismatchedIDException(existing, id);
		} else
			state.set("_id", id);
	}
	
	public String id() {
		return (String) state.get("_id");
	}

	@Override
	public int size() {
		return state.size();
	}

	@Override
	public void set(String fld, Object value) {
		if (fld == null)
			throw new IllegalArgumentException("field cannot be null");
		state.set(fld, value);
	}

	@Override
	public boolean has(String fld) {
		return state.has(fld);
	}

	@Override
	public Object get(String fld) {
		return state.get(fld);
	}

	public void clear(String fld) {
		state.clear(fld);
	}
	
	@Override
	public void all(FieldsTraverser traverser) {
		state.all(traverser);
	}

	@Override
	public void allPlus(FieldsTraverser traverser) {
		state.allPlus(traverser);
	}
}
