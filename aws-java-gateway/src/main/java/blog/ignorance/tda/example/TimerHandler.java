package blog.ignorance.tda.example;

import java.util.Date;

import com.couchbase.client.java.Bucket;
import com.couchbase.client.java.document.JsonDocument;
import com.couchbase.client.java.document.json.JsonArray;

import blog.ignorance.tda.interfaces.DesiresLogger;
import blog.ignorance.tda.interfaces.ProvideWSConnections;
import blog.ignorance.tda.interfaces.ServerLogger;
import blog.ignorance.tda.interfaces.TimerRequest;
import blog.ignorance.tda.interfaces.WSConnections;
import blog.ignorance.tda.interfaces.WithCouchbase;

public class TimerHandler implements TimerRequest, DesiresLogger, WithCouchbase, ProvideWSConnections {
	private Bucket bucket;
	private WSConnections connections;
	private ServerLogger logger;

	public void provideLogger(ServerLogger logger) {
		this.logger = logger;
	}
	
	public void withCouchbase(Bucket bucket) {
		this.bucket = bucket;
	}

	@Override
	public void wsConnections(WSConnections connections) {
		this.connections = connections;
	}

	@Override
	public void onTimer() {
		JsonDocument doc = this.bucket.get("groups/everybody");
		if (doc == null || doc.content() == null || !doc.content().containsKey("members"))
			return;
		
		try {
			JsonArray ja = doc.content().getArray("members");
			String msg = "Time is now " + new Date().toString();
			JsonArray copyTo = JsonArray.ja();
			for (int i=0;i<ja.size();i++) {
				if (connections.sendTo(ja.getString(i), msg))
					copyTo.add(ja.getString(i));
			}
			doc.content().put("members", copyTo);
			bucket.replace(doc);
		} catch (Throwable t) {
			logger.log("couchbase error", t);
		}
	}
}
