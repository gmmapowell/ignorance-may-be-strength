package test.ignorance.gls.helpers;

import java.util.Map;

import ignorance.tdastore.dynamo.DynamoHelper;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.ScanRequest;
import software.amazon.awssdk.services.dynamodb.model.ScanResponse;

public class DynamoTools {
	private final DynamoDbClient db;

	public DynamoTools() {
		DefaultCredentialsProvider credentialsProvider = DefaultCredentialsProvider.create();
		db = DynamoDbClient.builder()
			.credentialsProvider(credentialsProvider)
			.region(Region.US_EAST_1)
			.build();
	}

	public void cleanTable(String table) {
		ScanRequest req = ScanRequest.builder()
			.tableName(table)
			.build();
		ScanResponse resp = db.scan(req);
		System.out.println("Deleting " + resp.scannedCount() + " old items");
		for (Map<String, AttributeValue> i : resp.items()) {
			String key = i.get("_key").s();
			db.deleteItem(DynamoHelper.deleteKey(table, key));
		}
	}

}
