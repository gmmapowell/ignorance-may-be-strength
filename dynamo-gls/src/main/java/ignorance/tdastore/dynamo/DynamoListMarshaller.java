package ignorance.tdastore.dynamo;

import java.util.ArrayList;
import java.util.List;

import ignorance.marshalling.intf.MarshallingTraverser;

public class DynamoListMarshaller extends DynamoMarshaller implements MarshallingTraverser {
	private final DynamoMarshaller parent;
	private final List<Object> list = new ArrayList<>();

	public DynamoListMarshaller(DynamoMarshaller parent) {
		this.parent = parent;
	}

	@Override
	public void collect(Object o) {
		list.add(DynamoHelper.attr(o));
	}

	@Override
	public void complete() {
		if (!list.isEmpty())
			parent.collect(list);
	}
}
