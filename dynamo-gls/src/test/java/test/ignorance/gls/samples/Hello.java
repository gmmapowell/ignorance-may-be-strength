package test.ignorance.gls.samples;

import ignorance.gls.intf.UnitOfWork;
import ignorance.model.JVMFieldsContainerWrapper;

public class Hello  extends JVMFieldsContainerWrapper {
	public Hello(UnitOfWork uow) {
		super(uow, "_test.Hello");
	}

	public void greeting(String msg) {
		this.set("greeting", msg);
	}
	
	public String greeting() {
		return (String) this.get("greeting");
	}
}
