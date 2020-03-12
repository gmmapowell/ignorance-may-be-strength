package ignorance.tdastore.dynamo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ignorance.exceptions.NotImplementedException;
import ignorance.marshalling.intf.FieldsContainerWrapper;
import ignorance.marshalling.intf.FieldsMarshaller;
import ignorance.marshalling.intf.MarshallingTraverser;

public abstract class DynamoMarshaller implements MarshallingTraverser, DynamoCollector {
	public static final Logger logger = LoggerFactory.getLogger("awstxstore");

	@Override
	public void integer(Integer n) {
		collect(n);
	}

	@Override
	public void longint(Long l) {
		collect(l);
	}

	@Override
	public void string(String s) {
		collect(s);
	}

	@Override
	public void bool(Boolean b) {
		collect(b);
	}

	@Override
	public void real(Double d) {
		collect(d);
	}

	@Override
	public boolean handleCycle(Object o) {
//		throw new NotImplementedException();
		return false;
	}

	@Override
	public void circle(Object o, Object as) {
//		throw new NotImplementedException();
	}

	@Override
	public FieldsMarshaller beginFields(Class<? extends FieldsContainerWrapper> clz) {
		return new DynamoFieldsMarshaller(this, clz);
	}

	@Override
	public MarshallingTraverser beginList() {
		return new DynamoListMarshaller(this);
	}

	@Override
	public MarshallingTraverser beginMap() {
		return new DynamoMapMarshaller(this);
	}

	@Override
	public Object collectingAs() {
//		throw new NotImplementedException();
		return null;
	}

	@Override
	public void unpack(Object collectingAs) {
		throw new NotImplementedException();
	}

	@Override
	public void complete() {
//		throw new NotImplementedException();
	}
}
