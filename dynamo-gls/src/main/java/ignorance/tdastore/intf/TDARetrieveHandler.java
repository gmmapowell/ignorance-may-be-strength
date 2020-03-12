package ignorance.tdastore.intf;

// all instances of this should be created with context, to wit:
// the query they are thinking about
// the key they need to store results in ...
public interface TDARetrieveHandler {
	void notfound();

	// This should be some kind of abstract wrapper around an object
	// The wrapper can be used in a subsequent "replace" operation to remember ID and CAS, etc.
	// The contained object will have been unpacked from JSON using JsonArgListMarshaller.strategy()
	//   but possibly allow that logic to be exposed using a sensible interface
	// The construction of that can be found in JsonBeachhead
	<T> void found(RetrievedObject<T> retrieved);

	void error(Throwable ex);
}
