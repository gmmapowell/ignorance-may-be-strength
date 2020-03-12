package ignorance.marshalling.impl;

import ignorance.gls.intf.UnitOfWork;
import ignorance.marshalling.intf.FieldsContainerWrapper;
import ignorance.marshalling.intf.FieldsMarshaller;
import ignorance.utils.Reflection;

public class FieldsTraverser<T extends FieldsContainerWrapper> extends CollectingTraverser implements FieldsMarshaller {
	private final T ret;
	private String currentField;

	public FieldsTraverser(UnitOfWork uow, CollectionState state, Class<T> clz) {
		super(uow, state);
		ret = Reflection.create(clz, uow);
	}

	@Override
	public Object collectingAs() {
		return ret;
	}
	
	public T creation() {
		return ret;
	}

	@Override
	public void field(String x) {
		this.currentField = x;
	}
	
	@Override
	protected void collect(Object obj) {
		ret.set(currentField, obj);
	}
	
	@Override
	public void complete() {
	}
}
