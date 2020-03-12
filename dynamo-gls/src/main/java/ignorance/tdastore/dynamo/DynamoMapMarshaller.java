package ignorance.tdastore.dynamo;

import java.util.Map;
import java.util.TreeMap;

import ignorance.marshalling.intf.MarshallingTraverser;

public class DynamoMapMarshaller extends DynamoMarshaller implements MarshallingTraverser {
	private final DynamoMarshaller parent;
	private final Map<String, Object> map = new TreeMap<>();
	private String field;
	
	public DynamoMapMarshaller(DynamoMarshaller parent) {
		this.parent = parent;
	}

	@Override
	public void collect(Object obj) {
		if (field != null) {
			map.put(field, obj);
			field = null;
		} else
			field = (String) obj;
	}
	
	@Override
	public void complete() {
		if (!map.isEmpty())
			parent.collect(map);
	}
}
