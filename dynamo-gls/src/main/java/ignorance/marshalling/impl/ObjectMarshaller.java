package ignorance.marshalling.impl;

import java.util.List;

import ignorance.marshalling.intf.FieldsContainerWrapper;
import ignorance.marshalling.intf.FieldsMarshaller;
import ignorance.marshalling.intf.MarshallingTraverser;

public class ObjectMarshaller {
	private MarshallingTraverser top;

	public ObjectMarshaller(MarshallingTraverser top) {
		this.top = top;
	}
	
	public void marshal(Object o) throws ClassNotFoundException {
		marshal(top, o);
	}
	
	private void marshal(MarshallingTraverser ux, Object o) throws ClassNotFoundException {
		if (o == null)
			throw new RuntimeException("I don't EXPECT null to happen");
		if (ux.handleCycle(o))
			;
		else if (o instanceof Integer)
			ux.integer((Integer)o);
		else if (o instanceof Long)
			ux.longint((Long)o);
		else if (o instanceof Boolean)
			ux.bool((Boolean)o);
		else if (o instanceof Double)
			ux.real((Double)o);
		else if (o instanceof String)
			ux.string((String)o);
		else if (o instanceof FieldsContainerWrapper) {
			FieldsContainerWrapper fcw = (FieldsContainerWrapper)o;
			if (!fcw.has("_type"))
				throw new RuntimeException("No type defined in " + fcw);
			FieldsMarshaller uf = ux.beginFields(fcw.getClass());
			ux.circle(o, uf.collectingAs());
			fcw.allPlus((x,y) -> {
				uf.field(x);
				try {
					marshal(uf, y);
				} catch (ClassNotFoundException e) {
					e.printStackTrace();
				}
			});
			uf.complete();
		} else if (o instanceof List) {
			MarshallingTraverser ul = ux.beginList();
			@SuppressWarnings("unchecked")
			List<Object> list = (List<Object>)o;
			for (Object lo : list) {
				marshal(ul, lo);
			}
			ul.complete();
//		} else if (o instanceof Map) {
//			@SuppressWarnings("unchecked")
//			Map<String, Object> m = (Map<String, Object>) o;
//			traverseMap(ux, m);
		} else
			throw new RuntimeException("Not handled: " + o.getClass());
	}
}
