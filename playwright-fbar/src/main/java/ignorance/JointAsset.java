package ignorance;

public class JointAsset {
	private Asset value = new Asset();
	private AccountInfo other;
	
	public JointAsset jointWith(AccountInfo other) {
		this.other = other;
		return this;
	}
	
	public JointAsset setMaximumValue(int i) {
		value.setMaximumValue(i);
		return this;
	}

	public JointAsset setType(String string) {
		value.setType(string);
		return this;
	}

	public AccountInfo getOther() {
		return other;
	}

	public int getMaximumValue() {
		return value.getMaximumValue();
	}

	public String getType() {
		return value.getType();
	}
}
