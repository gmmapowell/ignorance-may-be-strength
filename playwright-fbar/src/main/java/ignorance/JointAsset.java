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

	public String getAccountNo() {
		return value.getAccountNo();
	}

	public JointAsset setAccountNo(String accountNo) {
		value.setAccountNo(accountNo);
		return this;
	}

	public String getAddress() {
		return value.getAddress();
	}

	public JointAsset setAddress(String address) {
		value.setAddress(address);
		return this;
	}

	public String getCity() {
		return value.getCity();
	}

	public JointAsset setCity(String city) {
		value.setCity(city);
		return this;
	}

	public String getState() {
		return value.getState();
	}

	public JointAsset setState(String state) {
		value.setState(state);
		return this;
	}

	public String getPostCode() {
		return value.getPostCode();
	}

	public JointAsset setPostCode(String postCode) {
		value.setPostCode(postCode);
		return this;
	}

	public String getCountry() {
		return value.getCountry();
	}

	public JointAsset setCountry(String country) {
		value.setCountry(country);
		return this;
	}

	public JointAsset setInstitution(String s) {
		value.setInstitution(s);
		return this;
	}

	public String getInstitution() {
		return value.getInstitution();
	}

	public boolean hasAddress() {
		return value.hasAddress();
	}

	public boolean hasCity() {
		return value.hasCity();
	}

	public boolean hasState() {
		return value.hasState();
	}

	public boolean hasPostCode() {
		return value.hasPostCode();
	}

	// "1" is something of a hack, but is true for every case I have, and probs for most people
	public int getNumOthers() {
		return 1;
	}
}
