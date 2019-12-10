package blog.ignorance.tda.example;

import com.couchbase.client.java.Bucket;
import com.couchbase.client.java.document.JsonDocument;
import com.couchbase.client.java.document.json.JsonArray;
import com.couchbase.client.java.document.json.JsonObject;

import blog.ignorance.tda.interfaces.DesiresLogger;
import blog.ignorance.tda.interfaces.ServerLogger;
import blog.ignorance.tda.interfaces.WSProcessor;
import blog.ignorance.tda.interfaces.WSResponder;
import blog.ignorance.tda.interfaces.WithCouchbase;

public class CounterSocket implements WSProcessor, DesiresLogger, WithCouchbase {
	private ServerLogger logger;
	private Bucket bucket;

	@Override
	public void provideLogger(ServerLogger logger) {
		this.logger = logger;
	}

	@Override
	public void withCouchbase(Bucket bucket) {
		this.bucket = bucket;
	}

	@Override
	public void open(WSResponder responder) {
		try {
			JsonDocument doc = bucket.get("groups/everybody");
			JsonArray members;
			if (doc == null) {
				members = JsonArray.ja();
				members.add(responder.connectionName());
				bucket.insert(JsonDocument.create("groups/everybody", JsonObject.jo().put("members", members)));
			} else {
				members = doc.content().getArray("members");
				members.add(responder.connectionName());
				bucket.replace(doc);
			}
		} catch (Throwable t) {
			logger.log("couchbase error", t);
		}
	}

	@Override
	public void onText(WSResponder responder, String text) {
		responder.send("Length: " + text.length());
	}

	@Override
	public void error() {
	}

	@Override
	public void close(WSResponder responder) {
		try {
			JsonDocument doc = bucket.get("groups/everybody");
			JsonArray ja = doc.content().getArray("members");
			JsonArray copyTo = JsonArray.ja();
			String conn = responder.connectionName();
			for (int i=0;i<ja.size();i++) {
				if (!conn.equals(ja.getString(i)))
					copyTo.add(ja.getString(i));
			}
			doc.content().put("members", copyTo);
			bucket.replace(doc);
		} catch (Throwable t) {
			logger.log("couchbase error", t);
		}
	}
}
