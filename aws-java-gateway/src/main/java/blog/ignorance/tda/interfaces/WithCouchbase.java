package blog.ignorance.tda.interfaces;

import com.couchbase.client.java.Bucket;

public interface WithCouchbase {

	void withCouchbase(Bucket bucket);

}
