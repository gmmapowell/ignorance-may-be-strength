package ignorance.tdastore.dynamo;

import java.util.Date;
import java.util.Map;
import java.util.TreeMap;
import java.util.concurrent.CompletableFuture;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ignorance.gls.impl.GLUnitOfWork;
import ignorance.gls.intf.UnitOfWork;
import ignorance.marshalling.impl.CollectingState;
import ignorance.marshalling.impl.ListTraverser;
import ignorance.marshalling.intf.ProvideIDOnCreate;
import ignorance.tdastore.common.UOWExecutor;
import ignorance.tdastore.intf.ExistingRecord;
import ignorance.tdastore.intf.TDACreateHandler;
import ignorance.tdastore.intf.TDADeleteHandler;
import ignorance.tdastore.intf.TDARetrieveHandler;
import ignorance.tdastore.intf.TDAStorage;
import ignorance.tdastore.intf.TDAUpdateHandler;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbAsyncClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.ConditionalCheckFailedException;
import software.amazon.awssdk.services.dynamodb.model.DeleteItemResponse;
import software.amazon.awssdk.services.dynamodb.model.GetItemRequest;
import software.amazon.awssdk.services.dynamodb.model.GetItemResponse;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest.Builder;
import software.amazon.awssdk.services.dynamodb.model.PutItemResponse;

public class AWSTxStorage implements TDAStorage {
	public static final Logger logger = LoggerFactory.getLogger("awstxstore");
	private final UOWExecutor uowexec;
	private final DynamoDbAsyncClient db;
	private final String table;

	public AWSTxStorage(UOWExecutor uowexec, String tableName) {
		this.uowexec = uowexec;
		this.table = tableName;
		DefaultCredentialsProvider credentialsProvider = DefaultCredentialsProvider.create();
		db = DynamoDbAsyncClient.builder()
			.credentialsProvider(credentialsProvider)
			.region(Region.US_EAST_1)
			.build();
	}
	
	@Override
	public void retrieve(UnitOfWork uow, String id, TDARetrieveHandler h) {
		GLUnitOfWork gu = (GLUnitOfWork) uow;
		GetItemRequest request = DynamoHelper.key(table, id);
		CompletableFuture<GetItemResponse> have = db.getItem(request);
		have.thenAccept(gr -> {
			Map<String, AttributeValue> ret = gr.item();
			if (ret == null || ret.isEmpty())
				uowexec.execute(gu, false, () -> h.notfound());
			else {
				DynamoRetrievedObject<Object> retr;
				try {
					AttributeValue ttl = gr.item().get("_ttl");
					long ctime = new Date().getTime()/1000;
					if (ttl != null) {
						if (Long.parseLong(ttl.n()) < ctime) {
							logger.info("Expiring " + id + " because TTL is " + ttl.n() + " at " + ctime);
							// if it has expired, pretend it isn't there even if DDB thinks it is
							uowexec.execute(gu, false, () -> h.notfound());
							return;
						}
					}
					AttributeValue vers = gr.item().get("_version");
					long version = Long.parseLong(vers.n());
					ListTraverser trav = new ListTraverser(uow, new CollectingState());
					DynamoExtractor extractor = new DynamoExtractor(this.getClass().getClassLoader());
					extractor.unmarshalMap(uow, trav, ret);
					Object obj = trav.asList().get(0);
					if (obj instanceof ProvideIDOnCreate)
						((ProvideIDOnCreate)obj).provideID(id);
					retr = new DynamoRetrievedObject<Object>(gu, this, id, obj, version);
				} catch (Exception ex) {
					uowexec.execute(gu, false, () -> {
						ex.printStackTrace();
						h.error(ex);
					});
					return;
				}
				uowexec.execute(gu, false, () -> h.found(retr));
			}
		});
		have.exceptionally(ex -> {
			logger.info("error retrieving" + id, ex);
			uowexec.execute(gu, false, () -> h.error(ex));
			return null;
		});
	}

	@Override
	public void create(UnitOfWork uow, String id, Object obj, TDACreateHandler h) {
		GLUnitOfWork gu = (GLUnitOfWork) uow;
		try {
			if (obj instanceof ProvideIDOnCreate)
				((ProvideIDOnCreate)obj).provideID(id);
			Map<String, String> names = new TreeMap<>();
			names.put("#k", "_key");
			Builder builder = DynamoHelper.putThing(table, id, 1L, obj)
				.expressionAttributeNames(names)
				.conditionExpression("attribute_not_exists(#k)");
			CompletableFuture<PutItemResponse> done = db.putItem(builder.build());
			done.thenAccept(x -> {
				gu.remember(id, new AWSCreatedObject(x));
				uowexec.execute(gu, false, () -> h.success());
			});
			done.exceptionally(ex -> {
				if (ex.getCause() instanceof ConditionalCheckFailedException) {
					uowexec.execute(gu, false, () -> { h.alreadyExists(); });
				} else {
					logger.error("error creating " + id, ex);
					uowexec.execute(gu, false, () -> { h.error(ex); });
				}
				return null;
			});
		} catch (Exception ex) {
			logger.error("error creating object", ex);
			uowexec.execute(gu, false, () -> h.error(ex));
		}
	}

	@Override
	public <T> void update(UnitOfWork uow, String id, ExistingRecord cas, Object obj, TDAUpdateHandler h) {
		GLUnitOfWork gu = (GLUnitOfWork) uow;
		try {
			VersionHolder vh = (VersionHolder) cas;
			Map<String, String> names = new TreeMap<>();
			names.put("#v", "_version");
			Map<String, AttributeValue> cv = new TreeMap<>();
			cv.put(":currentVersion", AttributeValue.builder().n(Long.toString(vh.getVersion())).build());
			PutItemRequest pir = DynamoHelper.putThing(table, id, vh.getVersion()+1, obj)
				.expressionAttributeNames(names)
				.conditionExpression("#v = :currentVersion")
				.expressionAttributeValues(cv)
				.build();
			CompletableFuture<PutItemResponse> done = db.putItem(pir);
			done.thenAccept(upd -> {
				uowexec.execute(gu, false, () -> { h.updated() ; });
			});
			done.exceptionally(ex -> {
				if (ex.getCause() instanceof ConditionalCheckFailedException) {
					uowexec.execute(gu, false, () -> { h.sinceChanged(); });
				} else {
					logger.error("error updating " + id, ex);
					uowexec.execute(gu, false, () -> { h.error(ex); });
				}
				return null;
			});
		} catch (Exception ex) {
			logger.error("error updating object", ex);
			uowexec.execute(gu, false, () -> h.error(ex));
		}
	}

	@Override
	public void delete(UnitOfWork uow, String id, TDADeleteHandler h) {
		GLUnitOfWork gu = (GLUnitOfWork) uow;
		CompletableFuture<DeleteItemResponse> done = db.deleteItem(DynamoHelper.deleteThing(table, id));
		done.thenAccept(upd -> {
			uowexec.execute(gu, false, () -> { h.success(); });
		});
		done.exceptionally(ex -> {
			logger.error("error deleting " + id, ex);
			uowexec.execute(gu, false, () -> { h.error(ex); });
			return null;
		});
	}
}
