package ignorance.gls.impl;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import ignorance.gls.intf.TxError;

public class RelationFailedException implements TxError {
	private final List<Throwable> exceptions = new ArrayList<>();
	
	public void add(Throwable ex) {
		exceptions.add(ex);
	}
	
	@Override
	public Iterator<Throwable> iterator() {
		return exceptions.iterator();
	}
}
