package ignorance.tdastore.dynamo;

import ignorance.tdastore.intf.ExistingRecord;
import software.amazon.awssdk.services.dynamodb.model.PutItemResponse;

public class AWSCreatedObject implements ExistingRecord {

	public AWSCreatedObject(PutItemResponse x) {
	}
}
