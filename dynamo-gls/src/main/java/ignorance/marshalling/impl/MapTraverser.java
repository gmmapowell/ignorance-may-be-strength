package ignorance.marshalling.impl;

import java.util.Map;
import java.util.TreeMap;

import ignorance.gls.intf.UnitOfWork;

public class MapTraverser extends CollectingTraverser {
	protected final Map<String, Object> ret;
	private String field;
	
	public MapTraverser(UnitOfWork uow, CollectionState state) {
		super(uow, state);
		ret = new TreeMap<String, Object>();
	}
	
	@Override
	public Object collectingAs() {
		return ret;
	}
	
	public Map<String, Object> asMap() {
		return ret;
	}

	
	@Override
	protected void collect(Object obj) {
		if (field != null) {
			ret.put(field, obj);
			field = null;
		} else
			field = (String) obj;
	}

	@Override
	public void complete() {
	}

}
