package ignorance.tdastore.dynamo;

import java.util.Collection;
import java.util.Map;
import java.util.TreeMap;

import ignorance.exceptions.NotImplementedException;
import ignorance.marshalling.impl.ObjectMarshaller;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.DeleteItemRequest;
import software.amazon.awssdk.services.dynamodb.model.GetItemRequest;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;

public class DynamoHelper {

	public static GetItemRequest key(String table, String id) {
		Map<String, AttributeValue> map = new TreeMap<>();
		map.put("_key", AttributeValue.builder().s(id).build());
		return GetItemRequest.builder()
			.tableName(table)
			.key(map)
			.build();
	}

	public static DeleteItemRequest deleteKey(String table, String id) {
		Map<String, AttributeValue> map = new TreeMap<>();
		map.put("_key", AttributeValue.builder().s(id).build());
		return DeleteItemRequest.builder()
			.tableName(table)
			.key(map)
			.build();
	}

	public static String string(Map<String, AttributeValue> item, String fld) {
		if (!item.containsKey(fld))
			return null;
		AttributeValue v = item.get(fld);
		return v.s();
	}

	public static Long longValue(Map<String, AttributeValue> item, String fld) {
		if (!item.containsKey(fld))
			return null;
		AttributeValue v = item.get(fld);
		return Long.parseLong(v.n());
	}

	public static PutItemRequest.Builder putThing(String table, String id, long version, Object obj) throws ClassNotFoundException {
		Map<String, AttributeValue> map = new TreeMap<>();
		map.put("_key", AttributeValue.builder().s(id).build());
		map.put("_version", AttributeValue.builder().n(Long.toString(version)).build());
		if (obj != null)
			marshalToMap(map, obj);
		return PutItemRequest.builder()
			.tableName(table)
			.item(map);
	}

	public static void marshalToMap(Map<String, AttributeValue> map, Object obj) throws ClassNotFoundException {
		DynamoTopLevelMarshaller dfm = new DynamoTopLevelMarshaller();
		ObjectMarshaller om = new ObjectMarshaller(dfm);
		om.marshal(obj);
		dfm.complete();
		dfm.store(map);
	}

	public static DeleteItemRequest deleteThing(String table, String key) {
		Map<String, AttributeValue> dmap = new TreeMap<>();
		dmap.put("_key", AttributeValue.builder().s(key).build());
		DeleteItemRequest dir = DeleteItemRequest.builder()
			.tableName(table)
			.key(dmap)
			.build();
		return dir;
	}


	public static void put(Map<String, AttributeValue> map, String key, Object val) {
		AttributeValue tmp = attr(val);
		map.put(key, tmp);
	}

	@SuppressWarnings("unchecked")
	public static AttributeValue attr(Object val) {
		if (val instanceof AttributeValue)
			return (AttributeValue) val;
		else if (val instanceof String)
			return AttributeValue.builder().s((String) val).build();
		else if (val instanceof Long) {
			return AttributeValue.builder().n(Long.toString((long) val)).build();
		} else if (val instanceof Collection) {
			return AttributeValue.builder().l((Collection<AttributeValue>)val).build();
		} else if (val instanceof Map) {
			return AttributeValue.builder().m((Map<String, AttributeValue>)val).build();
		} else
			throw new NotImplementedException(val.getClass().toString());
	}
}
