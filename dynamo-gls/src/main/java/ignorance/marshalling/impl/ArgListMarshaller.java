package ignorance.marshalling.impl;

import ignorance.marshalling.intf.MarshallingTraverser;

public class ArgListMarshaller {
	protected final int from;
	protected final int skipEnd;

	public ArgListMarshaller(boolean withFirst, boolean withLast) {
		this.from = withFirst?0:1;
		this.skipEnd = withLast?0:1;
	}

	public void marshal(MarshallingTraverser m, Object[] args) throws ClassNotFoundException {
		ObjectMarshaller om = new ObjectMarshaller(m);
		for (int i=from;i<args.length-skipEnd;i++) {
			om.marshal(args[i]);
		}
	}
}
