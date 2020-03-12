package ignorance.marshalling.impl;

import ignorance.exceptions.NotImplementedException;
import ignorance.gls.intf.UnitOfWork;
import ignorance.marshalling.intf.FieldsContainerWrapper;
import ignorance.marshalling.intf.FieldsMarshaller;
import ignorance.marshalling.intf.MarshallingTraverser;

public abstract class CollectingTraverser implements MarshallingTraverser {
	private final UnitOfWork uow;
	private final CollectionState state;

	public CollectingTraverser(UnitOfWork uow, CollectionState state) {
		this.uow = uow;
		this.state = state;
	}

	@Override
	public boolean handleCycle(Object o) {
		boolean ret = state.has(o);
		if (ret) {
			collect(state.get(o));
		}
		return ret;
	}
	
	@Override
	public void circle(Object o, Object as) {
		state.circle(o, as);
	}
	
	@Override
	public Object collectingAs() {
		throw new NotImplementedException();
	}

	@Override
	public void unpack(Object collectingAs) {
		state.circle(state.nextName(), collectingAs);
	}

	@Override
	public void string(String s) {
		collect(s);
	}

	@Override
	public void integer(Integer n) {
		collect(n);
	}

	@Override
	public void longint(Long l) {
		collect(l);
	}

	@Override
	public void bool(Boolean b) {
		collect(b);
	}

	@Override
	public void real(Double d) {
		collect(d);
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	@Override
	public FieldsMarshaller beginFields(Class<? extends FieldsContainerWrapper> clz) {
		FieldsTraverser<?> t = new FieldsTraverser(uow, state, clz);
		collect(t.creation());
		return t;
	}

	@Override
	public MarshallingTraverser beginList() {
		ListTraverser lt = new ListTraverser(uow, state);
		collect(lt.asList());
		return lt;
	}

	@Override
	public MarshallingTraverser beginMap() {
		MapTraverser mt = new MapTraverser(uow, state);
		collect(mt.asMap());
		return mt;
	}

	protected abstract void collect(Object obj);
}
