package ignorance.marshalling.intf;

public interface MarshallingTraverser {
	void integer(Integer n);
	void longint(Long l);
	void string(String s);
	void bool(Boolean b);
	void real(Double d);
	FieldsMarshaller beginFields(Class<? extends FieldsContainerWrapper> clz);
	MarshallingTraverser beginList();
	MarshallingTraverser beginMap();
	boolean handleCycle(Object o);
	void circle(Object o, Object as);
	Object collectingAs();
	void unpack(Object collectingAs);
	void complete();
}
