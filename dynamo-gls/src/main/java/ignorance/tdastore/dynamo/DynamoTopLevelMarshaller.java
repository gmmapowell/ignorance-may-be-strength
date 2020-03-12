package ignorance.tdastore.dynamo;

import java.util.Map;
import java.util.Map.Entry;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import software.amazon.awssdk.services.dynamodb.model.AttributeValue;

public class DynamoTopLevelMarshaller extends DynamoMarshaller {
	public static final Logger logger = LoggerFactory.getLogger("awstxstore");
	private AttributeValue toplevel;

	public DynamoTopLevelMarshaller() {
	}

	@Override
	public void collect(Object o) {
		this.toplevel = (AttributeValue)o;
	}

	public void makeUpsert(Map<String, String> names, Map<String, AttributeValue> values, StringBuilder sb) {
		Map<String, AttributeValue> m = toplevel.m();
		int n=0;
		for (Entry<String, AttributeValue> e : m.entrySet()) {
			String k = e.getKey();
			String hn;
			if (k.startsWith("_")) {
				hn = "#n" + (n++);
				names.put(hn, k);
			} else if (k.contains(".")) {
				String tmp = "n" + (n++);
				hn = '#' + tmp;
				names.put(hn, k);
				k = tmp;
			} else
				hn = k;
			sb.append(", " + hn + " = :" + k);
			values.put(":" + k, e.getValue());
		}
	}

	public void store(Map<String, AttributeValue> map) {
		map.putAll(toplevel.m());
	}
}
