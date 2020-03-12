package ignorance.gls.impl;

import ignorance.tdastore.intf.ExistingRecord;

public class LocallyCreatedRecord implements ExistingRecord {
	private final DoCreate doCreate;

	public LocallyCreatedRecord(DoCreate doCreate) {
		this.doCreate = doCreate;
	}

	public void updateWithValue(Object value) {
		this.doCreate.updateWithValue(value);
	}

	public void willBeDeleted() {
		this.doCreate.willBeDeleted();
	}
}
