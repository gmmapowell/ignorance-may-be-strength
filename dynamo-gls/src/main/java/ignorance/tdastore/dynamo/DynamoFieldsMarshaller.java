package ignorance.tdastore.dynamo;

import java.util.Map;
import java.util.TreeMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ignorance.exceptions.NotImplementedException;
import ignorance.marshalling.intf.FieldsContainerWrapper;
import ignorance.marshalling.intf.FieldsMarshaller;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;

public class DynamoFieldsMarshaller extends DynamoMarshaller implements FieldsMarshaller {
	public static final Logger logger = LoggerFactory.getLogger("awstxstore");
	private DynamoCollector parent;
	private String cfield;
	private Map<String, AttributeValue> values = new TreeMap<>();

	public DynamoFieldsMarshaller(DynamoCollector parent, Class<? extends FieldsContainerWrapper> clz) {
		this.parent = parent;
		DynamoHelper.put(values, "_clz", clz.getName());
	}

	@Override
	public void field(String x) {
		cfield = x;
	}

	@Override
	public void collect(Object o) {
		if (cfield == null)
			throw new NotImplementedException();
		DynamoHelper.put(values, cfield, o);
		cfield = null;
	}

	@Override
	public void complete() {
		if (parent != null)
			parent.collect(DynamoHelper.attr(values));
	}
}
