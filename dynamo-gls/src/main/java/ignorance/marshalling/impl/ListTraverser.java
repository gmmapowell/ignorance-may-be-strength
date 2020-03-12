package ignorance.marshalling.impl;

import java.util.ArrayList;
import java.util.List;

import ignorance.gls.intf.UnitOfWork;

public class ListTraverser extends CollectingTraverser {
	protected final List<Object> ret;

	public ListTraverser(UnitOfWork uow, CollectionState state) {
		super(uow, state);
		ret = new ArrayList<>();
	}

	@Override
	public Object collectingAs() {
		return ret;
	}
	
	public List<Object> asList() {
		return ret;
	}

	protected void collect(Object obj) {
		ret.add(obj);
	}
	
	@Override
	public void complete() {
	}
}
