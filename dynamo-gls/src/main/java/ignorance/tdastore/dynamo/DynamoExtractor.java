package ignorance.tdastore.dynamo;

import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ignorance.exceptions.NotImplementedException;
import ignorance.gls.intf.UnitOfWork;
import ignorance.marshalling.intf.FieldsContainerWrapper;
import ignorance.marshalling.intf.FieldsMarshaller;
import ignorance.marshalling.intf.MarshallingTraverser;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;

public class DynamoExtractor {
	public static final Logger logger = LoggerFactory.getLogger("awstxstore");
	private final ClassLoader classLoader;

	public DynamoExtractor(ClassLoader classLoader) {
		this.classLoader = classLoader;
	}

	public void unmarshal(UnitOfWork uow, MarshallingTraverser ux, AttributeValue a) throws ClassNotFoundException {
		if (a.s() != null) {
			ux.string(a.s());
		} else if (a.n() != null) {
			ux.longint(Long.parseLong(a.n()));
		} else if (a.hasL()) {
			unmarshalList(uow, ux, a.l());
		} else if (a.hasM()) {
			unmarshalMap(uow, ux, a.m());
		} else
			throw new NotImplementedException("cannot unmarshal " + a);
	}

	public void unmarshalMap(UnitOfWork uow, MarshallingTraverser ux, Map<String, AttributeValue> m) throws ClassNotFoundException {
		String clzName = ((AttributeValue) m.get("_clz")).s();
		@SuppressWarnings("unchecked")
		Class<? extends FieldsContainerWrapper> clz = (Class<? extends FieldsContainerWrapper>) Class.forName(clzName, false, classLoader);
		FieldsMarshaller fm = ux.beginFields(clz);
		ux.unpack(fm.collectingAs());
		for (Entry<String, AttributeValue> e : m.entrySet()) {
			fm.field(e.getKey());
			unmarshal(uow, fm, e.getValue());
		}
		fm.complete();
	}

	private void unmarshalList(UnitOfWork uow, MarshallingTraverser ux, List<AttributeValue> l) throws ClassNotFoundException {
		MarshallingTraverser lm = ux.beginList();
		ux.unpack(lm.collectingAs());
		for (AttributeValue a : l) {
			unmarshal(uow, lm, a);
		}
	}
}
