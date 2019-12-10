package blog.ignorance.tda.processing;

import java.util.concurrent.TimeUnit;

import com.couchbase.client.core.retry.BestEffortRetryStrategy;
import com.couchbase.client.java.Bucket;
import com.couchbase.client.java.CouchbaseCluster;
import com.couchbase.client.java.auth.PasswordAuthenticator;
import com.couchbase.client.java.env.DefaultCouchbaseEnvironment;
import com.couchbase.client.java.env.DefaultCouchbaseEnvironment.Builder;

import blog.ignorance.tda.interfaces.WithCouchbase;

public class CouchbaseEnvironment {
	private Bucket bucket;

	public CouchbaseEnvironment() {
		Builder builder = new DefaultCouchbaseEnvironment.Builder();
		builder.connectTimeout(10000);
		builder.kvTimeout(10000);
		builder.retryStrategy(BestEffortRetryStrategy.INSTANCE);
		DefaultCouchbaseEnvironment env = builder.build();
		
		String server = System.getenv("COUCHBASE");
		CouchbaseCluster cluster = CouchbaseCluster.fromConnectionString(env, server);
		String cbuser = System.getenv("CBUSER");
		String cbpasswd = System.getenv("CBPASSWD");
		PasswordAuthenticator authenticator = new PasswordAuthenticator(cbuser, cbpasswd);
		cluster.authenticate(authenticator);
		String testBucket = System.getenv("CBBUCKET");
		bucket = cluster.openBucket(testBucket, 15, TimeUnit.SECONDS);
	}

	public void provideBucketTo(WithCouchbase userHandler) {
		userHandler.withCouchbase(bucket);
	}

	@Override
	public String toString() {
		return "bucket = " + bucket;
	}
}
