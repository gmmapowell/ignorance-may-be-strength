package ignorance.marshalling.intf;

public interface FieldsMarshaller extends MarshallingTraverser {
	void field(String x);
	void complete();
}
