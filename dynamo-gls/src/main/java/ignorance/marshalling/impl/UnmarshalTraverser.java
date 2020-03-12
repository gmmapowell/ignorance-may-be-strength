package ignorance.marshalling.impl;

import ignorance.gls.intf.UnitOfWork;

public class UnmarshalTraverser extends ListTraverser {
	public UnmarshalTraverser(UnitOfWork uow, CollectionState state) {
		super(uow, state);
		ret.add(uow);
	}
}
